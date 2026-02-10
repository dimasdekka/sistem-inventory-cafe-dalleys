const { Kategori } = require("../models");

exports.getAll = async (req, res) => {
  try {
    const categories = await Kategori.findAll();
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.create = async (req, res) => {
  try {
    const category = await Kategori.create(req.body);
    res.status(201).json(category);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.update = async (req, res) => {
  try {
    await Kategori.update(req.body, { where: { id_kategori: req.params.id } });
    res.json({ message: "Kategori updated" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.delete = async (req, res) => {
  try {
    await Kategori.destroy({ where: { id_kategori: req.params.id } });
    res.json({ message: "Kategori deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
