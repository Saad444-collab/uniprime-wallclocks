const { Report, ReportTemplate, Document, FileMetadata } = require('../models').cluster4;
const createBaseRepository = require('../utils/baseRepository');

const report = createBaseRepository(Report);
const reportTemplate = createBaseRepository(ReportTemplate);
const document = createBaseRepository(Document);
const fileMetadata = createBaseRepository(FileMetadata);

module.exports = {
  cluster: 'cluster4',
  models: { Report, ReportTemplate, Document, FileMetadata },
  report,
  reportTemplate,
  document,
  fileMetadata
};