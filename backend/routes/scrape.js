// import express from 'express';
// import { performScraping } from '../services/scraper.js';

// const router = express.Router();

// router.post('/', async (req, res) => {
//     const { keyword } = req.body;
//     console.log('[API] Received request to scrape for keyword:', keyword);

//     try {
//         const result = await performScraping(keyword);
//         res.json(result);
//     } catch (error) {
//         console.error('[API ERROR] Scraping process failed:', error.message);
//         res.status(500).json({ error: error.message });
//     }
// });

// export default router;
import express from 'express';
import { performScraping } from '../services/scraper.js';

const router = express.Router();

router.post('/', async (req, res) => {
  const { keyword } = req.body;

  if (!keyword) {
    return res.status(400).json({ message: 'Keyword is required' });
  }

  try {
    const result = await performScraping(keyword);
    return res.status(200).json({ data: result });  // ✅ wrapped inside `data`
  } catch (err) {
    console.error('[API ERROR]', err);
    return res.status(500).json({ message: 'Scraping process failed' });
  }
});

export default router;
