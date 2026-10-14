// Esta é a camada que TODAS as páginas usam para ler/gravar dados.
// Antes ela mandava fetch() para o backend Node.
// Agora ela fala direto com o Firebase (Auth + Firestore), sem Storage.
//
// Os nomes das funções (api.list, api.create, api.login, etc.) foram
// mantidos EXATAMENTE iguais aos de antes, de propósito: assim nenhuma
// página React precisa mudar, só esta camada por baixo.
import {
  EmailAuthProvider,
  createUserWithEmailAndPassword,
  reauthenticateWithCredential,
  updatePassword,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  updateProfile as updateAuthProfile
} from 'firebase/auth';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getCountFromServer,
  getDoc,
  getDocs,
  limit as fsLimit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where
} from 'firebase/firestore';
import { auth, db } from './firebaseClient';

// Nomes das "gavetas" (coleções) do Firestore — precisam bater com as
// mesmas usadas nas regras de segurança (firestore.rules).
const COLLECTIONS = {
  users: 'usuarios',
  properties: 'propriedades',
  areas: 'areas',
  diagnostics: 'diagnosticos',
  plans: 'planos_transicao',
  applications: 'aplicacoes_manejo',
  alternatives: 'manejos_alternativos',
  monitoring: 'monitoramentos',
  technical: 'acompanhamentos_tecnicos',
  documents: 'documentos',
  documentFiles: 'documentos_arquivos',
  calendar: 'calendario',
  harvests: 'safras',
  employees: 'funcionarios',
  inputs: 'insumos',
  finance: 'financeiro',
  soilAnalyses: 'analises_solo',
  certification: 'certificacao',
  supportMessages: 'suporte_mensagens',
  // Área do agrônomo
  agroProperties: 'agro_propriedades',
  agroProducers: 'agro_produtores',
  agroDiagnostics: 'agro_diagnosticos',
  agroActivities: 'agro_atividades',
  agroEquipment: 'agro_equipamentos',
  agroReports: 'agro_laudos'
};

function col(moduleKey) {
  const name = COLLECTIONS[moduleKey];
  if (!name) throw new Error(`Módulo desconhecido: ${moduleKey}`);
  return collection(db, name);
}

function currentUid() {
  const u = auth.currentUser;
  if (!u) throw new Error('Não autenticado');
  return u.uid;
}

// Tenta executar uma escrita no Firestore algumas vezes, com pequenas
// pausas entre as tentativas. Usado logo após criar a conta no
// Authentication, quando o token de login pode levar um instante para
// propagar e a primeira escrita pode ser recusada por permissão mesmo
// com as regras corretas.
async function salvarComRetry(fn, tentativas = 3, esperaMs = 700) {
  let ultimoErro;
  for (let i = 0; i < tentativas; i++) {
    try {
      return await fn();
    } catch (e) {
      ultimoErro = e;
      const permissao = String(e?.code || e?.message || '').includes('permission');
      if (!permissao || i === tentativas - 1) throw e;
      await new Promise((resolve) => setTimeout(resolve, esperaMs));
    }
  }
  throw ultimoErro;
}

// ---------- Perfil do usuário (guardado à parte, na coleção "usuarios") ----------
// O tipo é comparado sempre em minúsculas ("Admin" digitado no Console
// também vale como "admin").
const normalizaTipo = (p) => ({ ...p, tipoUsuario: String(p.tipoUsuario || '').trim().toLowerCase() });

async function fetchProfile(uid) {
  const snap = await getDoc(doc(db, COLLECTIONS.users, uid));
  return snap.exists() ? normalizaTipo({ id: snap.id, uid: snap.id, ...snap.data() }) : null;
}

export const api = {
  // ---------- Autenticação ----------
  async login(identifier, password) {
    const cred = await signInWithEmailAndPassword(auth, identifier, password);
    const profile = await fetchProfile(cred.user.uid);
    if (!profile) throw new Error('Perfil do usuário não encontrado');
    if (profile.status === 'BLOQUEADO') {
      await signOut(auth);
      throw new Error('Usuário bloqueado');
    }
    if (profile.tipoUsuario === 'agronomo' && profile.aprovado === false) {
      await signOut(auth);
      throw new Error('Cadastro de agrônomo aguardando aprovação');
    }
    return { user: { uid: cred.user.uid, ...profile } };
  },

  async register(body) {
    const tipo = body.tipoUsuario || 'produtor';
    if (!body.email || !body.senha || !body.nomeCompleto)
      throw new Error('Nome, e-mail e senha são obrigatórios');
    const cred = await createUserWithEmailAndPassword(auth, body.email, body.senha);
    await updateAuthProfile(cred.user, { displayName: body.nomeCompleto });
    const profile = {
      nomeCompleto: body.nomeCompleto,
      email: String(body.email).toLowerCase(),
      telefone: body.telefone || '',
      cpf: body.cpf || '',
      crea: body.crea || '',
      tipoUsuario: tipo,
      status: 'ATIVO',
      // Agrônomo precisa ser aprovado por um admin antes de acessar.
      aprovado: tipo !== 'agronomo',
      criadoEm: serverTimestamp(),
      atualizadoEm: serverTimestamp()
    };
    // Logo depois de criar a conta no Authentication, o token de login
    // pode levar um instante para propagar antes que as regras do
    // Firestore reconheçam o usuário como autenticado. Tentamos de novo
    // algumas vezes antes de desistir, em vez de falhar na primeira.
    try {
      await salvarComRetry(() => setDoc(doc(db, COLLECTIONS.users, cred.user.uid), profile));
    } catch (e) {
      // Se mesmo com retry não deu certo, desfaz a criação da conta no
      // Authentication. Sem isso, o e-mail ficaria "preso" — a pessoa
      // não conseguiria logar (falta o perfil) nem se cadastrar de novo
      // (o e-mail já existiria).
      try {
        await cred.user.delete();
      } catch (_) {
        // Se nem isso for possível (ex: sessão expirou), segue o erro
        // original — o suporte/admin resolve manualmente pelo Console.
      }
      throw e;
    }
    return { uid: cred.user.uid, ...profile };
  },

  async forgot(emailAddr) {
    // Usa o fluxo pronto do Firebase: envia um LINK de redefinição por
    // e-mail (diferente do código numérico que existia antes).
    await sendPasswordResetEmail(auth, emailAddr);
    return true;
  },

  async reset() {
    // Com o Firebase, a redefinição acontece na página de link enviada
    // por e-mail (fora do app). Esta função fica só para compatibilidade.
    throw new Error('Use o link enviado por e-mail para redefinir sua senha.');
  },

  async profile() {
    const uid = currentUid();
    const profile = await fetchProfile(uid);
    if (!profile) throw new Error('Perfil não encontrado');
    return { uid, ...profile };
  },

  async updateProfile(body) {
    const uid = currentUid();
    const allowed = {};
    if (body.nomeCompleto !== undefined) allowed.nomeCompleto = body.nomeCompleto;
    if (body.telefone !== undefined) allowed.telefone = body.telefone;
    if (body.fotoUrl !== undefined) allowed.fotoUrl = body.fotoUrl;
    allowed.atualizadoEm = serverTimestamp();
    await updateDoc(doc(db, COLLECTIONS.users, uid), allowed);
    if (allowed.nomeCompleto && auth.currentUser)
      await updateAuthProfile(auth.currentUser, { displayName: allowed.nomeCompleto });
    return fetchProfile(uid);
  },

  // Troca a senha do usuário logado. O Firebase exige confirmar a senha
  // atual (reautenticação) antes de aceitar a nova.
  async changePassword(senhaAtual, novaSenha) {
    const u = auth.currentUser;
    if (!u) throw new Error('Não autenticado');
    await reauthenticateWithCredential(u, EmailAuthProvider.credential(u.email, senhaAtual));
    await updatePassword(u, novaSenha);
    return true;
  },

  // ---------- CRUD genérico (usado por CrudPage e várias páginas) ----------
  // Limite padrão de itens carregados por vez. Exposto para que a UI
  // possa avisar o usuário quando ele for atingido.
  LIST_LIMIT: 200,

  async list(moduleKey) {
    const uid = currentUid();
    // Ordena do mais novo para o mais antigo. Requer que os documentos
    // tenham o campo "criadoEm" (todos os criados por api.create têm).
    const q = query(
      col(moduleKey),
      where('usuarioUid', '==', uid),
      orderBy('criadoEm', 'desc'),
      fsLimit(this.LIST_LIMIT)
    );
    let snap;
    try {
      snap = await getDocs(q);
    } catch (err) {
      // Registros antigos podem não ter "criadoEm"; nesse caso o orderBy
      // falha. Caímos de volta para uma consulta sem ordenação para não
      // quebrar dados legados.
      if (String(err?.message || '').includes('orderBy') || err?.code === 'failed-precondition') {
        snap = await getDocs(
          query(col(moduleKey), where('usuarioUid', '==', uid), fsLimit(this.LIST_LIMIT))
        );
      } else {
        throw err;
      }
    }
    const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    // Sinaliza (de forma não intrusiva) que pode haver mais registros do
    // que o limite. A UI pode checar items.__hasMore se quiser avisar.
    if (items.length === this.LIST_LIMIT) {
      Object.defineProperty(items, '__hasMore', { value: true, enumerable: false });
    }
    return items;
  },

  async create(moduleKey, body) {
    const uid = currentUid();
    const data = {
      ...body,
      usuarioUid: uid,
      criadoEm: serverTimestamp(),
      atualizadoEm: serverTimestamp()
    };
    const ref2 = await addDoc(col(moduleKey), data);
    return { id: ref2.id, ...data };
  },

  async get(moduleKey, id) {
    const uid = currentUid();
    const snap = await getDoc(doc(db, COLLECTIONS[moduleKey], id));
    if (!snap.exists()) throw new Error('Registro não encontrado');
    if (snap.data().usuarioUid !== uid) throw new Error('Acesso negado');
    return { id: snap.id, ...snap.data() };
  },

  async update(moduleKey, id, body) {
    const uid = currentUid();
    const docRef = doc(db, COLLECTIONS[moduleKey], id);
    const current = await getDoc(docRef);
    if (!current.exists()) throw new Error('Registro não encontrado');
    if (current.data().usuarioUid !== uid) throw new Error('Acesso negado');
    await updateDoc(docRef, { ...body, atualizadoEm: serverTimestamp() });
    const updated = await getDoc(docRef);
    return { id: updated.id, ...updated.data() };
  },

  async remove(moduleKey, id) {
    const uid = currentUid();
    const docRef = doc(db, COLLECTIONS[moduleKey], id);
    const current = await getDoc(docRef);
    if (!current.exists()) throw new Error('Registro não encontrado');
    if (current.data().usuarioUid !== uid) throw new Error('Acesso negado');
    await deleteDoc(docRef);
    return true;
  },

  // ---------- Dashboard ----------
  async summary() {
    // Antes era calculado no backend. Agora cada página busca o que
    // precisa direto; aqui devolvemos um resumo simples e seguro.
    // getCountFromServer conta no servidor sem baixar os documentos —
    // muito mais barato do que ler tudo só para contar.
    const uid = currentUid();
    const propsCount = await getCountFromServer(
      query(col('properties'), where('usuarioUid', '==', uid))
    );
    return { propriedades: propsCount.data().count };
  },

  // ---------- Administração ----------
  // Atenção: estas 3 funções só funcionam se as REGRAS do Firestore
  // liberarem leitura/escrita da coleção "usuarios" para quem tiver
  // tipoUsuario == "admin". Veja o arquivo firestore.rules.
  async users() {
    const snap = await getDocs(collection(db, COLLECTIONS.users));
    return snap.docs.map((d) => normalizaTipo({ id: d.id, ...d.data() }));
  },

  async updateUser(id, body) {
    await updateDoc(doc(db, COLLECTIONS.users, id), {
      ...body,
      atualizadoEm: serverTimestamp()
    });
    return true;
  },

  async adminStats() {
    // Contagens agregadas no servidor (getCountFromServer) — não baixa
    // os documentos, só o número. Escala bem mesmo com muitos registros.
    const keys = ['users', 'properties', 'plans', 'agroProperties', 'diagnostics', 'agroDiagnostics', 'supportMessages'];
    const counts = await Promise.all(
      keys.map((k) => getCountFromServer(collection(db, COLLECTIONS[k])).then((s) => s.data().count))
    );
    const c = Object.fromEntries(keys.map((k, i) => [k, counts[i]]));
    return {
      usuarios: c.users,
      propriedades: c.properties,
      planosAtivos: c.plans,
      propriedadesAgro: c.agroProperties,
      diagnosticos: c.diagnostics + c.agroDiagnostics,
      mensagens: c.supportMessages
    };
  },

  // ---------- Área do administrador ----------
  // Leem/alteram registros de TODOS os usuários. Só funcionam para quem as
  // regras do Firestore reconhecem como admin (ehAdmin em firestore.rules).
  async adminListAll(moduleKey, max = 500) {
    const snap = await getDocs(query(col(moduleKey), fsLimit(max)));
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  },

  async adminUpdate(moduleKey, id, body) {
    await updateDoc(doc(db, COLLECTIONS[moduleKey], id), {
      ...body,
      atualizadoEm: serverTimestamp()
    });
    return true;
  },

  async adminRemove(moduleKey, id) {
    await deleteDoc(doc(db, COLLECTIONS[moduleKey], id));
    return true;
  },

  // Resposta do suporte: grava na conversa do usuário (usuarioUid dele),
  // com autor "suporte", e aparece no Chat dele em tempo real.
  async adminReply(usuarioUid, text) {
    const texto = String(text || '').trim();
    if (!texto) throw new Error('Mensagem vazia');
    await addDoc(col('supportMessages'), {
      usuarioUid,
      texto,
      autor: 'suporte',
      respondidoPor: currentUid(),
      criadoEm: serverTimestamp()
    });
    return true;
  },

  // ---------- Chat / Suporte (coleção suporte_mensagens) ----------
  // Envia uma mensagem do usuário logado. Fica protegida pelas regras:
  // cada usuário só lê e escreve as próprias mensagens (usuarioUid).
  async sendMessage(text) {
    const uid = currentUid();
    const data = {
      usuarioUid: uid,
      texto: String(text || '').trim(),
      autor: 'usuario',
      criadoEm: serverTimestamp()
    };
    if (!data.texto) throw new Error('Mensagem vazia');
    const ref2 = await addDoc(col('supportMessages'), data);
    return { id: ref2.id, ...data };
  },

  // Escuta as mensagens do usuário em tempo real. Retorna a função de
  // "unsubscribe" para o componente parar de escutar ao desmontar.
  onMessages(callback) {
    const uid = currentUid();
    const q = query(
      col('supportMessages'),
      where('usuarioUid', '==', uid),
      orderBy('criadoEm', 'asc'),
      fsLimit(200)
    );
    return onSnapshot(
      q,
      (snap) => callback(snap.docs.map((d) => ({ id: d.id, ...d.data() }))),
      () => callback([])
    );
  },

  // ---------- Upload de arquivos (direto no Firestore, sem Storage) ----------
  // O Firebase Storage exige o plano pago (Blaze). Para ficar 100% no plano
  // gratuito, o conteúdo do arquivo vai em base64 num documento separado
  // (coleção documentos_arquivos). Fica separado da lista "documentos" para
  // que a listagem não baixe o conteúdo de todos os arquivos de uma vez.
  // Limite: um documento do Firestore tem no máximo 1 MiB, por isso fotos
  // são reduzidas/comprimidas antes e outros arquivos precisam ter até
  // MAX_FILE_BYTES.
  MAX_FILE_BYTES: 700 * 1024,

  async upload(file) {
    const uid = currentUid();
    const dataUrl = await prepararArquivo(file, this.MAX_FILE_BYTES);
    const ref2 = await addDoc(col('documentFiles'), {
      usuarioUid: uid,
      nome: file.name,
      tipo: dataUrl.slice(5, dataUrl.indexOf(';')),
      dados: dataUrl,
      criadoEm: serverTimestamp()
    });
    return { arquivoId: ref2.id };
  },

  // Devolve { nome, tipo, dados } do arquivo guardado por api.upload.
  async getFile(arquivoId) {
    const snap = await getDoc(doc(db, COLLECTIONS.documentFiles, arquivoId));
    if (!snap.exists()) throw new Error('Arquivo não encontrado');
    return snap.data();
  }
};

function lerComoDataUrl(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

// Tamanho aproximado, em bytes, do conteúdo de um data URL base64.
function bytesDoDataUrl(dataUrl) {
  return Math.ceil(((dataUrl.length - dataUrl.indexOf(',') - 1) * 3) / 4);
}

// Fotos: reduz para no máx. 1600px e comprime em JPEG até caber no limite.
// Outros arquivos (PDF etc.) vão como estão, se couberem.
async function prepararArquivo(file, maxBytes) {
  if (/^image\/(jpeg|png|webp)$/.test(file.type)) {
    const img = await new Promise((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = () => reject(new Error('Imagem inválida'));
      el.src = URL.createObjectURL(file);
    });
    let lado = 1600;
    for (let tentativa = 0; tentativa < 6; tentativa++) {
      const escala = Math.min(1, lado / Math.max(img.width, img.height));
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(img.width * escala);
      canvas.height = Math.round(img.height * escala);
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#fff'; // PNG transparente não fica com fundo preto no JPEG
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.72);
      if (bytesDoDataUrl(dataUrl) <= maxBytes) {
        URL.revokeObjectURL(img.src);
        return dataUrl;
      }
      lado = Math.round(lado * 0.75);
    }
    URL.revokeObjectURL(img.src);
  } else if (file.size <= maxBytes) {
    return lerComoDataUrl(file);
  }
  const kb = Math.round(maxBytes / 1024);
  throw new Error(`ARQUIVO_GRANDE: o arquivo precisa ter no máximo ${kb} KB.`);
}

// Usado pelo AuthContext para saber, em tempo real, se há alguém logado
// (substitui o antigo "ler token salvo no localStorage").
export function onAuthChange(callback) {
  return onAuthStateChanged(auth, async (fbUser) => {
    if (!fbUser) return callback(null);
    const profile = await fetchProfile(fbUser.uid);
    callback(profile ? { uid: fbUser.uid, ...profile } : null);
  });
}

export async function logoutFirebase() {
  await signOut(auth);
}
