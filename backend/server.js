require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Supabase Client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const tableName = process.env.TABLE_NAME;

if (!supabaseUrl || !supabaseKey || !tableName) {
    console.error('Error: SUPABASE_URL, SUPABASE_ANON_KEY, and TABLE_NAME must be set in .env file');
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Mapper Function: Database Row -> Frontend Interface
const mapDatabaseRowToFrontend = (row) => {
    // Parse JSON fields if they are strings (supabase-js usually auto-parses jsonb, but good to be safe)
    const safeJson = (val) => (typeof val === 'string' ? JSON.parse(val) : val);

    return {
        id: row.id,
        // Metadata (Inferred or placeholder if not in table)
        staff_id: 'EMP-2024-001', // Placeholder or fetch if available
        staff_name: 'Training Agent', // Placeholder
        overall_status: 'Completed',
        call_date: new Date(row.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        call_duration: '15:00 min', // Placeholder

        // Critical Data
        audio_url: 'https://dcs-spotify.megaphone.fm/WAYW6918246177.mp3?key=c0f202b20175e6b49fa3c7d48ea9d43f', // Placeholder for now, or fetch if in DB
        transcript: "Agent: Hello...\nCustomer: Hi...", // Placeholder or fetch

        // Evaluation Data
        Red_Flags: safeJson(row.redFlags) || [],

        SOP_Adherence: {
            tag: row.sopAdherenceTag || 'N/A',
            note: row.sopAdherenceNote || ''
        },

        SOP_Steps: safeJson(row.sopSteps) || [],

        Soft_Skills: {
            communication_clarity_structure: {
                tag: row.communicationClarityTag || 'N/A',
                note: row.communicationClarityNote || ''
            },
            empathy_kindness_respect_tone: {
                tag: row.empathyTag || 'N/A',
                note: row.empathyNote || ''
            },
            confidence: {
                tag: row.confidenceTag || 'N/A',
                note: row.confidenceNote || ''
            },
            active_listening: {
                tag: row.activeListeningTag || 'N/A',
                note: row.activeListeningNote || ''
            }
        },

        Pressure_Objection_Handling: {
            pressure_objection_level: row.pressureObjectionLevel || 'N/A',
            tag: row.pressureObjectionTag || 'N/A',
            note: row.pressureObjectionNote || '',
            evidence: row.pressureObjectionEvidence || ''
        },

        Learning_Behavior_Engagement: {
            tag: row.learningBehaviorTag || 'N/A',
            note: row.learningBehaviorNote || ''
        },

        Alternates_Solutions_Escalations_Discounts: safeJson(row.alternatesSolutions) || [],

        // Handle potentially string or array fields
        Strengths_Pointers: typeof row.strengths === 'string' ? row.strengths.split(',') : (row.strengths || []),
        Weakness_Pointers: typeof row.weaknesses === 'string' ? row.weaknesses.split(',') : (row.weaknesses || [])
    };
};

// API: Get All Evaluations (List View)
app.get('/api/evaluations', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from(tableName)
            .select('id, created_at, sopAdherenceTag, pressureObjectionTag') // Corrected column names
            .order('created_at', { ascending: false });

        if (error) throw error;

        // Map for list view - keep it lightweight
        const listViewData = data.map(row => ({
            id: row.id,
            created_at: row.created_at,
            sop_tag: row.sopAdherenceTag,
            pressure_tag: row.pressureObjectionTag,
            display_date: new Date(row.created_at).toLocaleDateString()
        }));

        res.json(listViewData);
    } catch (err) {
        console.error('Error fetching list:', err);
        res.status(500).json({ error: err.message });
    }
});

// API: Get Single Evaluation by ID
app.get('/api/evaluations/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { data, error } = await supabase
            .from(tableName)
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;
        if (!data) return res.status(404).json({ error: 'Evaluation not found' });

        const formattedData = mapDatabaseRowToFrontend(data);
        res.json(formattedData);
    } catch (err) {
        console.error('Error fetching details:', err);
        res.status(500).json({ error: err.message });
    }
});

app.listen(port, () => {
    console.log(`Backend server running on http://localhost:${port}`);
});
