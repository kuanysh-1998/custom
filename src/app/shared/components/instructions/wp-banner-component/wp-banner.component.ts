import { Component, Input } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { LocalizationService } from 'src/app/shared/services/localization.service';

interface InstructionItem {
  content: string;
  subItems?: InstructionItem[];
  imageSrc?: string;
  imageAlt?: string;
  imageCaption?: string;
}

@Component({
  selector: 'wp-instruction-banner',
  templateUrl: './wp-banner.component.html',
  styleUrls: ['./wp-banner.component.scss'],
})
export class InstructionBannerComponent {
  @Input() instructionTitle: string;
  @Input() instructionDescription: string;
  @Input() instructionItems: any[];
  @Input() footerText: string;

  constructor(
    private titleService: Title,
    private localizationService: LocalizationService
  ) {}

  ngOnInit() {
    const localizedTitle = this.localizationService.getSync('Инструкция');
    this.titleService.setTitle(localizedTitle);
  }
}
