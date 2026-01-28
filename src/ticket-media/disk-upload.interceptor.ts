// disk-upload.interceptor.ts
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { v4 as uuid } from 'uuid';

export const TicketMediaUploadInterceptor = FileInterceptor('file', {
    storage: diskStorage({
        // destination: '/var/www/myapp/uploads/tickets',
        destination: 'E:/Downloads/Hiten/Ticket-Media',
        filename: (req, file, cb) => {
            const id = uuid();
            cb(null, `${id}${extname(file.originalname)}`);
        },
    }),
    limits: {
        fileSize: 100 * 1024 * 1024, // 100MB
    },
});

// curl -X POST http://localhost:3000/ticket-media/upload \ -F "file=@E:/Downloads/Hiten/images/Hiten.jpg" \ -F "ticketId=123e4567-e89b-12d3-a456-426614174000" \ -F "fileType=IMAGE"


