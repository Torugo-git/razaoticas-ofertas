const functions = require("firebase-functions");
const admin = require("firebase-admin");
const axios = require("axios");
const cors = require("cors")({origin: true});

// Inicializa o Firebase Admin SDK
admin.initializeApp();

// É uma boa prática armazenar chaves secretas em variáveis de ambiente.
const RECAPTCHA_SECRET_KEY = "6LfqMsYrAAAAAGy9bj8IorX0n4laqqXsR-KmgVzX";

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

      // 2. SE A VERIFICAÇÃO PASSAR, SALVAR OS DADOS NO FIRESTORE
      const db = admin.firestore();

      // Adiciona a data do cadastro usando o timestamp do servidor
      const finalLeadData = {
          ...leadDataFromClient,
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
