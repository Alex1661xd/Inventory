import { IsBoolean, IsOptional } from 'class-validator';

export class CleanupAuthOrphansDto {
    @IsOptional()
    @IsBoolean()
    dryRun?: boolean = true;
}
