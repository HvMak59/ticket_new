// ticket-media.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { unlink } from 'fs/promises';
import { FileType, TicketMedia } from './entities/ticket-media.entity';
import { CreateTicketMediaDto } from './dto/create-ticket.dto';

@Injectable()
export class TicketMediaService {
    constructor(
        @InjectRepository(TicketMedia)
        private readonly repo: Repository<TicketMedia>,
    ) { }

    async create(
        file: Express.Multer.File,
        createTicketMediaDto: CreateTicketMediaDto,
    ) {
        // const media = new TicketMedia({
        //     ticketId: dto.ticketId,
        //     filePath: file.path,
        //     fileType: dto.fileType,
        //     fileName: file.originalname,
        //     mimeType: file.mimetype,
        //     size: file.size,
        //     isResolutionProof: dto.isResolutionProof ?? false,
        // });

        const media = new TicketMedia({
            ...createTicketMediaDto,
            fileName: file.originalname,
            mimeType: file.mimetype,
            size: file.size,
        });
        return this.repo.save(media);
    }

    buildFromFiles(
        files: Express.Multer.File[],
    ) {
        return files.map((file) =>
            this.repo.create({
                filePath: file.path, // set by interceptor
                fileName: file.originalname,
                mimeType: file.mimetype,
                size: file.size,
                // fileType: FileType.IMAGE,
                fileType: file.mimetype.startsWith('image/')
                    ? FileType.IMAGE
                    : FileType.VIDEO,
            }),
        );
    }

    async findById(id: string) {
        const media = await this.repo.findOneBy({ id });
        if (!media) throw new NotFoundException('File not found');
        return media;
    }
    async findAll() {
        // return await this.repo.find();
        const medias = await this.repo.find();

        return medias.map(m => ({
            ...m,
            fileUrl: `http://localhost:3000/uploads/${m.filePath}`,
        }));
    }

    async delete(id: string) {
        const media = await this.findById(id);

        await unlink(media.filePath); // delete from disk
        await this.repo.delete(id);   // delete from DB
    }
}