// ticket-media.controller.ts
import {
    Controller,
    Post,
    UploadedFile,
    UseInterceptors,
    Body,
    Get,
    Param,
    Res,
    Delete,
} from '@nestjs/common';
import { Response } from 'express';
import { TicketMediaService } from './ticket-media.services';
import { TicketMediaUploadInterceptor } from './disk-upload.interceptor';
import { CreateTicketMediaDto } from './dto/create-ticket.dto';

@Controller('ticket-media')
export class TicketMediaController {
    constructor(private readonly service: TicketMediaService) { }

    // UPLOAD
    @Post('upload')
    @UseInterceptors(TicketMediaUploadInterceptor)
    async upload(
        @UploadedFile() file: Express.Multer.File,
        @Body() dto: CreateTicketMediaDto,
    ) {
        return this.service.create(file, dto);
    }

    // DOWNLOAD / VIEW
    @Get(':id')
    async getFile(@Param('id') id: string, @Res() res: Response) {
        const media = await this.service.findById(id);
        return res.sendFile(media.filePath);
    }

    // DELETE
    @Delete(':id')
    async delete(@Param('id') id: string) {
        await this.service.delete(id);
        return { success: true };
    }
}