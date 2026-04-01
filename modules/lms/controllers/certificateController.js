import { dbConnect } from '@/lib/dbConnect';
import mongoose from 'mongoose';
import { certificateService } from '@/modules/lms/services/certificateService';
import { badRequest, json } from '@/modules/lms/utils/api';

export async function listCertificates() {
  await dbConnect();
  const certificates = await certificateService.listCertificates();
  return json({ success: true, count: certificates.length, data: certificates });
}

export async function createCertificate(request) {
  await dbConnect();
  const body = await request.json();

  if (!body.name || !body.courseId) {
    return badRequest('name and courseId are required');
  }

  const payload = {
    name: body.name,
    description: body.description,
    templateUrl: body.templateUrl,
    courseId: body.courseId
  };

  const certificate = await certificateService.createCertificate(payload);
  return json({ success: true, data: certificate }, 201);
}

export async function getCertificate(request, { params }) {
  await dbConnect();
  const { id } = await params;

  if (!id) {
    return badRequest('Missing ID');
  }
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return badRequest('Invalid certificate ID');
  }

  const certificate = await certificateService.getCertificateById(id);
  if (!certificate) {
    return json({ success: false, error: 'Certificate not found' }, 404);
  }

  return json({ success: true, data: certificate });
}

export async function updateCertificate(request, { params }) {
  await dbConnect();
  const { id } = await params;

  if (!id) {
    return badRequest('Missing ID');
  }
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return badRequest('Invalid certificate ID');
  }

  const body = await request.json();

  const payload = {
    name: body.name,
    description: body.description,
    templateUrl: body.templateUrl,
    courseId: body.courseId
  };

  const updated = await certificateService.updateCertificate(id, payload);
  if (!updated) {
    return json({ success: false, error: 'Certificate not found' }, 404);
  }

  return json({ success: true, data: updated });
}

export async function deleteCertificate(request, { params }) {
  await dbConnect();
  const { id } = await params;
  const deleted = await certificateService.deleteCertificate(id);

  if (!deleted) {
    return json({ success: false, error: 'Certificate not found' }, 404);
  }

  return json({ success: true, data: {} });
}
