// Az alkalmazás verzióját adja vissza (SZINKRON)
const getVer = (req, res) => {
    return res.json({ version: process.env.VERSION || 'NaN' }) // Alapértelmezett érték, ha nincs beállítva
}

module.exports = {
    getVer,
}
