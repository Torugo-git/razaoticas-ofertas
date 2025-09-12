const functions = require("firebase-functions");
const admin = require("firebase-admin");
const axios = require("axios");
const cors = require("cors")({origin: true});

// Inicializa o Firebase Admin SDK
admin.initializeApp();

// A chave secreta agora é lida da configuração de ambiente segura do Firebase.
const RECAPTCHA_SECRET_KEY = functions.config().recaptcha.secret;

exports.submitLead = functions.region('us-central1').https.onRequest((req, res) => {
  // Envolve a função com o middleware CORS para permitir requisições do seu site
  cors(req, res, async () => {
    // Permite apenas requisições POST
    if (req.method !== "POST") {
      return res.status(405).json({message: "Método não permitido."});
    }

    try {
      // Extrai o token e o restante dos dados do corpo da requisição
      const { recaptchaToken, ...leadDataFromClient } = req.body;

      // 1. VERIFICAR O TOKEN RECAPTCHA
      if (!recaptchaToken) {
        console.log("Token do reCAPTCHA ausente.");
        return res.status(400).json({message: "Token do reCAPTCHA é obrigatório."});
      }

      const verificationURL = `https://www.google.com/recaptcha/api/siteverify?secret=${RECAPTCHA_SECRET_KEY}&response=${recaptchaToken}`;
      const recaptchaResponse = await axios.post(verificationURL);
      const { success, score } = recaptchaResponse.data;

      // Verifica se o reCAPTCHA foi validado e se a pontuação é aceitável
      if (!success || score < 0.5) {
        console.log("Falha na verificação do reCAPTCHA", recaptchaResponse.data);
        return res.status(400).json({ message: "Falha na verificação de segurança. Tente novamente." });
      }

      // 2. SANITIZAR OS DADOS DO LEAD ANTES DE SALVAR
      const escapeHtml = (unsafe) => {
        if (typeof unsafe !== 'string') return unsafe;
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
      };

      const sanitizeObject = (obj) => {
        const sanitized = {};
        for (const key in obj) {
            const value = obj[key];
            if (typeof value === 'string') {
                sanitized[key] = escapeHtml(value);
            } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
                sanitized[key] = sanitizeObject(value); // Sanitize nested objects
            } else {
                sanitized[key] = value; // Keep non-string, non-object values as is
            }
        }
        return sanitized;
      };

      const sanitizedLeadData = sanitizeObject(leadDataFromClient);

      // 3. SE A VERIFICAÇÃO PASSAR, SALVAR OS DADOS NO FIRESTORE
      const db = admin.firestore();

      // Adiciona a data do cadastro usando o timestamp do servidor
      const finalLeadData = {
          ...sanitizedLeadData,
          dataCadastro: admin.firestore.FieldValue.serverTimestamp()
      };

      await db.collection("leads").add(finalLeadData);

      console.log(`Lead salvo com sucesso. Pontuação do reCAPTCHA: ${score}`);
      res.status(200).json({ message: "Cadastro realizado com sucesso!" });

    } catch (error) {
      console.error("Erro interno no servidor:", error);
      res.status(500).json({ message: "Ocorreu um erro inesperado. Por favor, tente mais tarde." });
    }
  });
});
