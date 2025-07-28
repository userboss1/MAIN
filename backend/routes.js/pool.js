import express from 'express';
import { ObjectId } from 'mongodb';
import { get as getDB } from '../config/db.js'; // Correctly aliasing 'get' to 'getDB'

const router = express.Router();

// HELPER to check for valid MongoDB ObjectId
const isValidObjectId = (id) => {
    return ObjectId.isValid(id) && String(new ObjectId(id)) === id;
};

// --- ADDED: Get all pools for the admin panel's main list ---
router.get('/', async (req, res) => {
    try {
        const db = getDB();
        const pools = await db.collection('pools').find({}).sort({ createdAt: -1 }).toArray();
        res.status(200).send({ success: true, pools });
    } catch (error) {
        console.error("Error fetching all pools:", error);
        res.status(500).send({ success: false, error: "Internal server error." });
    }
});


// Create a pool
router.post('/create', async (req, res) => {
    const { name, totalAmount, adminShare } = req.body;

    if (!name || !totalAmount) {
        return res.status(400).send({ success: false, error: '`name` and `totalAmount` are required.' });
    }
    if (typeof totalAmount !== 'number' || (adminShare && typeof adminShare !== 'number')) {
        return res.status(400).send({ success: false, error: '`totalAmount` and `adminShare` must be numbers.' });
    }

    try {
        const db = getDB();
        const pool = {
            name,
            totalAmount,
            adminShare: adminShare || 0,
            createdAt: new Date()
        };

        const result = await db.collection('pools').insertOne(pool);
        res.status(201).send({ success: true, message: 'Pool created successfully.', poolId: result.insertedId });
    } catch (error) {
        console.error("Error creating pool:", error);
        res.status(500).send({ success: false, error: "Internal server error." });
    }
});

// Add a person to a pool
router.post('/add-person', async (req, res) => {
    const { poolId, personName, amount } = req.body;

    if (!poolId || !personName || !amount) {
        return res.status(400).send({ success: false, error: '`poolId`, `personName`, and `amount` are required.' });
    }
    if (!isValidObjectId(poolId)) {
        return res.status(400).send({ success: false, error: 'Invalid Pool ID format.' });
    }
    if (typeof amount !== 'number') {
        return res.status(400).send({ success: false, error: '`amount` must be a number.' });
    }

    try {
        const db = getDB();
        const person = {
            poolId: new ObjectId(poolId),
            personName,
            amount,
            createdAt: new Date()
        };

        await db.collection('people').insertOne(person);
        res.status(201).send({ success: true, message: 'Person added to pool successfully.' });
    } catch (error) {
        console.error("Error adding person:", error);
        res.status(500).send({ success: false, error: "Internal server error." });
    }
});

// Admin adds more shares to a pool
router.post('/admin/add-shares', async (req, res) => {
    const { poolId, extraAmount } = req.body;

    if (!poolId || !extraAmount) {
        return res.status(400).send({ success: false, error: '`poolId` and `extraAmount` are required.' });
    }
    if (!isValidObjectId(poolId)) {
        return res.status(400).send({ success: false, error: 'Invalid Pool ID format.' });
    }
    if (typeof extraAmount !== 'number') {
        return res.status(400).send({ success: false, error: '`extraAmount` must be a number.' });
    }

    try {
        const db = getDB();
        await db.collection('pools').updateOne(
            { _id: new ObjectId(poolId) },
            { $inc: { adminShare: extraAmount } }
        );
        res.status(200).send({ success: true, message: 'Admin share updated successfully.' });
    } catch (error) {
        console.error("Error updating admin shares:", error);
        res.status(500).send({ success: false, error: "Internal server error." });
    }
});

// Get a detailed summary of a pool
router.get('/:poolId/summary', async (req, res) => {
    const { poolId } = req.params;

    if (!isValidObjectId(poolId)) {
        return res.status(400).send({ success: false, error: 'Invalid Pool ID format.' });
    }

    try {
        const db = getDB();
        const pool = await db.collection('pools').findOne({ _id: new ObjectId(poolId) });

        if (!pool) {
            return res.status(404).send({ success: false, error: 'Pool not found.' });
        }

        const people = await db.collection('people').find({ poolId: new ObjectId(poolId) }).toArray();

        const totalInvestedByPeople = people.reduce((sum, person) => sum + person.amount, 0);
        const adminShare = pool.adminShare || 0;
        const totalInvestment = totalInvestedByPeople + adminShare;
        const remainingAmount = pool.totalAmount - totalInvestment;

        // --- UPDATED: Cleaned up percentage calculations ---
        const calculatePercentage = (amount, total) => {
            if (total === 0) return 0;
            // Round to 2 decimal places
            return parseFloat(((amount / total) * 100).toFixed(2));
        };

        const peopleWithShares = people.map(person => ({
            ...person,
            sharePercentage: calculatePercentage(person.amount, pool.totalAmount)
        }));

        const adminSharePercentage = calculatePercentage(adminShare, pool.totalAmount);

        const summary = {
            poolDetails: {
                _id: pool._id,
                name: pool.name,
                totalAmount: pool.totalAmount,
                createdAt: pool.createdAt
            },
            investmentStatus: {
                totalInvestment,
                remainingAmount,
                isFunded: totalInvestment >= pool.totalAmount
            },
            adminContribution: {
                amount: adminShare,
                sharePercentage: adminSharePercentage
            },
            investors: peopleWithShares,
            investorCount: people.length
        };

        res.status(200).send({ success: true, summary });

    } catch (error) {
        console.error("Error fetching pool summary:", error);
        res.status(500).send({ success: false, error: "Internal server error." });
    }
});

export default router;
