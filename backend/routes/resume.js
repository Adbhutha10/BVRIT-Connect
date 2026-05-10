const express = require('express');
const router = express.Router();
const multer = require('multer');
const fs = require('fs');

// Configure multer for file handling
const upload = multer({
    dest: 'uploads/temp/',
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Helper function to extract info from text
const extractInfo = (text) => {
    const info = {
        email: '',
        phone: '',
        linkedinUrl: '',
        githubUrl: '',
        skills: [],
        links: []
    };

    // Extract Email
    const emailRegex = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/gi;
    const emailMatch = text.match(emailRegex);
    if (emailMatch && emailMatch.length > 0) {
        info.email = emailMatch[0];
    }

    // Extract Phone (basic patterns)
    // Matches: 9876543210, +91-9876543210, 987 654 3210
    const phoneRegex = /(\+?\d{1,3}[- ]?)?\d{10}/g;
    const phoneMatch = text.match(phoneRegex);
    if (phoneMatch && phoneMatch.length > 0) {
        info.phone = phoneMatch[0];
    }

    // Extract Links (LinkedIn, GitHub)
    const linkedinRegex = /linkedin\.com\/in\/[a-zA-Z0-9_-]+/gi;
    const linkedinMatch = text.match(linkedinRegex);
    if (linkedinMatch) {
        info.linkedinUrl = 'https://www.' + linkedinMatch[0].replace(/^(https?:\/\/)?(www\.)?/, '');
    }

    const githubRegex = /github\.com\/[a-zA-Z0-9_-]+/gi;
    const githubMatch = text.match(githubRegex);
    if (githubMatch) {
        info.githubUrl = 'https://www.' + githubMatch[0].replace(/^(https?:\/\/)?(www\.)?/, '');
    }

    // Extract Skills (Keyword matching)
    // List of common tech skills to look for
    const commonSkills = [
        "JavaScript", "Python", "Java", "C++", "C#", "React", "Angular", "Vue",
        "Node.js", "Express", "Django", "Flask", "Spring", "SQL", "NoSQL",
        "MongoDB", "PostgreSQL", "AWS", "Azure", "Docker", "Kubernetes",
        "Git", "Machine Learning", "AI", "Data Science", "HTML", "CSS",
        "TypeScript", "Go", "Rust", "Swift", "Kotlin", "Flutter"
    ];

    const foundSkills = new Set();
    const lowerText = text.toLowerCase();

    commonSkills.forEach(skill => {
        // Simple case-insensitive search
        // A more robust way would use Regex with word boundaries \b
        const regex = new RegExp(`\\b${skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
        if (regex.test(text)) {
            foundSkills.add(skill);
        }
    });

    info.skills = Array.from(foundSkills);

    return info;
};

router.post('/extract', upload.single('resume'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    try {
        const dataBuffer = fs.readFileSync(req.file.path);

        let text = '';

        if (req.file.mimetype === 'application/pdf') {
            const { PDFParse } = require('pdf-parse');
            const parser = new PDFParse({ data: dataBuffer });
            try {
                const data = await parser.getText();
                text = data.text;
            } catch (pdfError) {
                console.error('PDF parsing detailed error:', pdfError);
                throw new Error('Failed to parse PDF content: ' + pdfError.message);
            } finally {
                await parser.destroy();
            }
        } else {
            // For now only robust PDF support, basic text for others if needed
            // DOCX requires mammoth or similar, skipping for "minor project" scope unless requested
            text = dataBuffer.toString('utf8');
        }

        const extractedData = extractInfo(text);

        // Clean up temp file
        fs.unlinkSync(req.file.path);

        res.json({
            success: true,
            data: extractedData
        });

    } catch (error) {
        console.error('Resume extraction error:', error);

        // Clean up temp file if exists
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }

        res.status(500).json({
            success: false,
            message: 'Failed to parse resume',
            error: error.message
        });
    }
});

module.exports = router;
