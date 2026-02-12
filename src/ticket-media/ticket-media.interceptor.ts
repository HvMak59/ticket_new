// import { FilesInterceptor } from '@nestjs/platform-express';
// import { diskStorage } from 'multer';
// import { extname, join } from 'path';

// export const TicketMediaInterceptor = FilesInterceptor(
//     'files',
//     10,
//     {
//         storage: diskStorage({
//             destination: join(process.cwd(), 'uploads', 'temp'),
//             filename: (req, file, cb) => {
//                 const ext = extname(file.originalname);
//                 cb(null, `${Date.now()}-${Math.random()}${ext}`);
//             },
//         }),
//         fileFilter: (req, file, cb) => {
//             if (!file.mimetype.startsWith('image/')) {
//                 cb(new Error('Only images allowed'), false);
//             }
//             cb(null, true);
//         },
//     },
// );



import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { v4 as uuidv4 } from 'uuid';

export const TicketMediaInterceptor = FilesInterceptor(
    'media',             // field name from frontend
    4,                  // max number of files
    {
        storage: diskStorage({
            destination: join(process.cwd(), 'uploads', 'temp'),
            filename: (req, file, cb) => {
                const fileName = uuidv4();
                const extention = extname(file.originalname);

                cb(null, `${fileName}${extention}`);
            },
        }),
        fileFilter: (req, file, cb) => {
            if (!file.mimetype.startsWith('image/')) {
                cb(new Error('Only images allowed'), false);
            }
            cb(null, true);
        },
        // {
        //         // limits: {
        //         //     fileSize: 5 * 1024 * 1024,
        //         // },
        // }
    },
);
