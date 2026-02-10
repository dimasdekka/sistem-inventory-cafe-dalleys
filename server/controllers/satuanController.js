const { Satuan } = require("../models");

exports.getAll = async (req, res) => {
  try {
    const units = await Satuan.findAll();
    res.json(units);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.create = async (req, res) => {
  try {
    const unit = await Satuan.create(req.body);
    res.status(201).json(unit);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.update = async (req, res) => {
  try {
    await Satuan.update(req.body, { where: { id_satuan: req.params.id } });
    res.json({ message: "Satuan updated" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.delete = async (req, res) => {
  try {
    await Satuan.destroy({ where: { id_satuan: req.params.id } });
    res.json({ message: "Satuan deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
