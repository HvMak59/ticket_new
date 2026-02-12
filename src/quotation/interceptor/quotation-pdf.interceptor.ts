import { FileInterceptor } from '@nestjs/platform-express';

export const QuotationPdfInterceptor = FileInterceptor('pdf', {
    // limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        if (file.mimetype !== 'application/pdf') {
            return cb(new Error('Only PDF allowed'), false);
        }
        cb(null, true);
    },
});
