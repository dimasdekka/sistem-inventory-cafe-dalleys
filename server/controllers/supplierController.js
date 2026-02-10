const { Supplier } = require("../models");

exports.getAll = async (req, res) => {
  try {
    const suppliers = await Supplier.findAll();
    res.json(suppliers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.create = async (req, res) => {
  try {
    const supplier = await Supplier.create(req.body);
    res.status(201).json(supplier);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.update = async (req, res) => {
  try {
    await Supplier.update(req.body, { where: { id_supplier: req.params.id } });
    res.json({ message: "Supplier updated" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.delete = async (req, res) => {
  try {
    await Supplier.destroy({ where: { id_supplier: req.params.id } });
    res.json({ message: "Supplier deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
