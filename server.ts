
import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import axios from 'axios';
import crypto from 'crypto';
import admin from 'firebase-admin';
import firebaseConfig from './firebase-applet-config.json' assert { type: 'json' };

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    projectId: firebaseConfig.projectId,
  });
}
const db = admin.firestore();
if (firebaseConfig.firestoreDatabaseId) {
  // @ts-ignore - databaseId is supported in newer versions of firebase-admin
  db.settings({ databaseId: firebaseConfig.firestoreDatabaseId });
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // --- CINETPAY CONFIG (SANDBOX MODE) ---
  const CINETPAY_SITE_ID = process.env.CINETPAY_SITE_ID || '443750';
  const CINETPAY_API_KEY = process.env.CINETPAY_API_KEY || '462758687627506324d5460.43739216';
  const CINETPAY_SECRET_KEY = process.env.CINETPAY_SECRET_KEY || 'YOUR_SECRET_KEY';
  const APP_URL = process.env.APP_URL || 'http://localhost:3000';

  // --- API ROUTES ---

  /**
   * INITIALIZE PAYMENT
   * Called by frontend when user clicks "Pay"
   */
  app.post('/api/payments/init', async (req, res) => {
    try {
      const { amount, currency, description, customer_name, customer_surname, customer_email, customer_phone_number, transaction_id, userId, providerId, isSimulation } = req.body;

      const transId = transaction_id || `APNET_${Date.now()}`;

      // 1. Create a pending transaction in Firestore
      await db.collection('transactions').doc(transId).set({
        clientId: userId,
        prestataireId: providerId,
        amount: amount,
        currency: currency || 'XOF',
        status: 'PENDING',
        description: description || 'Paiement de service APNET',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        method: 'MOBILE_MONEY',
        isSimulation: !!isSimulation
      });

      // If simulation, we don't call CinetPay, we just return a fake success
      if (isSimulation) {
        // Simulate a delayed webhook call
        setTimeout(async () => {
          console.log(`[SIMULATION] Automatically confirming transaction ${transId}`);
          await db.collection('transactions').doc(transId).update({
            status: 'PAID',
            paidAt: admin.firestore.FieldValue.serverTimestamp(),
            cinetpay_data: { status: 'ACCEPTED', amount: amount, currency: currency || 'XOF', simulation: true }
          });
        }, 2000);

        return res.json({
          success: true,
          payment_url: '#simulation',
          payment_token: 'sim_token_' + Date.now(),
          isSimulation: true
        });
      }

      const payload = {
        apikey: CINETPAY_API_KEY,
        site_id: CINETPAY_SITE_ID,
        transaction_id: transId,
        amount: amount,
        currency: currency || 'XOF',
        description: description || 'Paiement de service APNET',
        notify_url: `${APP_URL}/api/payments/webhook`,
        return_url: `${APP_URL}/payment-success`,
        channels: 'ALL',
        customer_name: customer_name || 'Client',
        customer_surname: customer_surname || 'APNET',
        customer_email: customer_email || 'client@apnet.ci',
        customer_phone_number: customer_phone_number || '',
      };

      const response = await axios.post('https://api-checkout.cinetpay.com/api/v2/payment', payload);
      
      if (response.data.code === '201') {
        res.json({
          success: true,
          payment_url: response.data.data.payment_url,
          payment_token: response.data.data.payment_token
        });
      } else {
        res.status(400).json({ success: false, message: response.data.message });
      }
    } catch (error: any) {
      console.error('CinetPay Init Error:', error.response?.data || error.message);
      res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
  });

  /**
   * WEBHOOK (NOTIFICATION URL)
   * Called by CinetPay when payment status changes
   */
  app.post('/api/payments/webhook', async (req, res) => {
    try {
      const { cpm_site_id, cpm_trans_id, cpm_trans_status, cpm_payment_config } = req.body;

      console.log(`Webhook received for transaction ${cpm_trans_id}: ${cpm_trans_status}`);

      // 1. Verify the transaction status with CinetPay API
      const verifyPayload = {
        apikey: CINETPAY_API_KEY,
        site_id: CINETPAY_SITE_ID,
        transaction_id: cpm_trans_id
      };

      const verifyResponse = await axios.post('https://api-checkout.cinetpay.com/api/v2/payment/check', verifyPayload);
      const data = verifyResponse.data;

      if (data.code === '00' && data.data.status === 'ACCEPTED') {
        // PAYMENT SUCCESSFUL
        console.log(`Payment confirmed for ${cpm_trans_id}`);
        
        // 2. Update Firestore to mark transaction as PAID
        await db.collection('transactions').doc(cpm_trans_id).update({
          status: 'PAID',
          paidAt: admin.firestore.FieldValue.serverTimestamp(),
          cinetpay_data: data.data
        });
        
        return res.status(200).send('OK');
      }

      res.status(200).send('Payment not accepted yet');
    } catch (error: any) {
      console.error('Webhook Error:', error.message);
      res.status(500).send('Error');
    }
  });

  /**
   * PAYOUT (TRANSFER)
   * Triggered when a service is validated by the client
   */
  app.post('/api/payments/payout', async (req, res) => {
    try {
      const { amount, prefix, phone, notify_url, client_transaction_id } = req.body;

      // CinetPay Transfer API requires a specific token
      // First, get the transfer token
      const tokenResponse = await axios.post('https://api-checkout.cinetpay.com/api/v1/transfer/spec/get/token', {
        apikey: CINETPAY_API_KEY,
        password: 'YOUR_TRANSFER_PASSWORD' // This is usually a separate password set in CinetPay dashboard
      });

      if (tokenResponse.data.code !== '00') {
        return res.status(400).json({ success: false, message: 'Could not get transfer token' });
      }

      const token = tokenResponse.data.data.token;

      // Execute transfer
      const transferPayload = {
        token: token,
        data: [{
          amount: amount,
          prefix: prefix || '225',
          phone: phone,
          notify_url: notify_url || `${APP_URL}/api/payments/payout-webhook`,
          client_transaction_id: client_transaction_id || `PAYOUT_${Date.now()}`
        }]
      };

      const transferResponse = await axios.post('https://api-checkout.cinetpay.com/api/v1/transfer/money', transferPayload);

      res.json({
        success: transferResponse.data.code === '00',
        data: transferResponse.data
      });
    } catch (error: any) {
      console.error('Payout Error:', error.response?.data || error.message);
      res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
  });

  /**
   * SOURCETABLE API ENDPOINT
   * Returns providers and revenue data for dashboarding
   */
  app.get('/api/sourcetable/data', async (req, res) => {
    const apiKey = req.headers['x-api-key'];
    const EXPECTED_API_KEY = process.env.SOURCETABLE_API_KEY || 'apnet_sec_9823_dash_771';

    if (!apiKey || apiKey !== EXPECTED_API_KEY) {
      return res.status(401).json({ error: 'Unauthorized: Invalid or missing API Key' });
    }

    try {
      // 1. Fetch Providers
      const providersSnapshot = await db.collection('users')
        .where('role', '==', 'PROVIDER')
        .get();
      
      const providers = providersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...(doc.data() as any)
      }));

      // 2. Fetch Paid Transactions for Revenue
      const transactionsSnapshot = await db.collection('transactions')
        .where('status', '==', 'PAID')
        .get();
      
      const transactions = transactionsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...(doc.data() as any)
      }));

      const totalRevenue = transactions.reduce((sum, t) => sum + (t.amount || 0), 0);

      // 3. Prepare data for Sourcetable
      res.json({
        summary: {
          totalProviders: providers.length,
          totalRevenue: totalRevenue,
          currency: 'XOF'
        },
        providers: providers.map(p => ({
          name: `${p.firstName} ${p.lastName || ''}`,
          email: p.email,
          job: p.jobTitle,
          verified: p.isVerified,
          balance: p.walletBalance
        })),
        recentTransactions: transactions.slice(0, 50).map(t => ({
          date: t.paidAt ? (t.paidAt as admin.firestore.Timestamp).toDate().toISOString() : t.createdAt,
          amount: t.amount,
          status: t.status,
          description: t.description
        }))
      });
    } catch (error: any) {
      console.error('Sourcetable API Error:', error.message);
      res.status(500).json({ error: 'Failed to fetch dashboard data' });
    }
  });

  // --- VITE MIDDLEWARE ---
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
