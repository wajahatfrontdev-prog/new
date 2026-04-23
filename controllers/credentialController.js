const Credential = require('../models/credential');

exports.uploadCredential = async (req, res) => {
  try {
    const { type, title, documentUrl, expiryDate } = req.body;
    const credential = await Credential.create({
      user: req.user._id,
      type,
      title,
      documentUrl,
      expiryDate
    });
    res.status(201).json({ success: true, credential });
  } catch (error) {
    console.error("Upload Credential Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.getMyCredentials = async (req, res) => {
  try {
    const credentials = await Credential.find({ user: req.user._id });
    res.status(200).json({ success: true, credentials });
  } catch (error) {
    console.error("Get Credentials Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.deleteCredential = async (req, res) => {
  try {
    const { id } = req.params;
    const cred = await Credential.findOne({ _id: id, user: req.user._id });
    if (!cred) return res.status(404).json({ message: "Credential not found" });
    if (cred.status === 'verified') {
      return res.status(403).json({ message: "Verified credentials cannot be deleted. Contact Admin." });
    }
    await Credential.findByIdAndDelete(id);
    res.status(200).json({ success: true, message: "Credential deleted" });
  } catch (error) {
    console.error("Delete Credential Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
