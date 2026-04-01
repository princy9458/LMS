import Certificate from '@/modules/lms/models/Certificate';

export const certificateService = {
  async createCertificate(data) {
    return Certificate.create(data);
  },

  async listCertificates() {
    return Certificate.find({}).sort({ createdAt: -1 });
  },

  async getCertificateById(id) {
    return Certificate.findById(id);
  },

  async updateCertificate(id, data) {
    return Certificate.findByIdAndUpdate(id, data, { new: true });
  },

  async deleteCertificate(id) {
    return Certificate.findByIdAndDelete(id);
  }
};
