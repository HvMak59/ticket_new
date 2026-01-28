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
import { extname } from 'path';

export const TicketMediaInterceptor = FilesInterceptor(
    'files',             // field name from frontend
    10,                  // max number of files
    {
        storage: diskStorage({
            destination: '../images',
            filename: (req, file, cb) => {
                const uniqueSuffix =
                    Date.now() + '-' + Math.round(Math.random() * 1e9);

                const ext = extname(file.originalname);

                cb(null, `${uniqueSuffix}${ext}`);
            },
        }),

        // limits: {
        //     fileSize: 5 * 1024 * 1024,
        // },

        fileFilter: (req, file, cb) => {
            if (!file.mimetype.startsWith('image/')) {
                cb(new Error('Only images allowed'), false);
            }
            cb(null, true);
        },
    },
);