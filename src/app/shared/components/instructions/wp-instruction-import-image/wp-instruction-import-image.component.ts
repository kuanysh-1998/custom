import { Component } from '@angular/core';

@Component({
  selector: 'wp-img-import-instruction',
  templateUrl: './wp-instruction-import-image.component.html',
  styleUrls: ['./wp-instruction-import-image.component.scss'],
})
export class WpImgImportInstructionComponent {
  instructionTitle = 'Инструкция по импорту фотографий сотрудников';
  instructionDescription = 'Ознакомьтесь с требованиями перед импортом архива';
  instructionItems = [
    {
      content: 'Требования к архиву:',
      subItems: [
        { content: 'размер архива не должен превышать 20 МБ' },
        { content: 'архив должен соответствовать формату zip' },
      ],
    },
    {
      content: 'Требования к фотографиям:',
      subItems: [
        { content: 'размер фотографии в архиве не должен превышать 6 МБ' },
        {
          content:
            'фотография в архиве должна соответствовать формату jpeg/jpg/png/bmp/jfif',
        },
        {
          content:
            'название фотографии должно соответствовать формату “Фамилия Имя Отчество” или "Фамилия Имя" Пример заполнения: “Сапарова Аружан Алиевна”',
        },
      ],
      imageSrc: 'assets/image/example-zip.png',
      imageAlt: 'Background Image',
      imageCaption: 'Пример содержимого архива',
    },
    {
      content: 'Также для более качественного распознавания лиц рекомендуется:',
      subItems: [
        {
          content:
            'добавлять фотографию сотрудника в локации, в которой сотрудник будет отмечать приход/уход',
        },
        {
          content:
            'добавлять оригиналы фотографий (не отсканированные, не сфотографированные версии)',
        },
      ],
    },
  ];
  footerNote =
    'Примечание: если по названию фотографии в выбранном отделе будет найден сотрудник в системе, фотография добавится к нему. При отсутствии совпадений в выбранном отделе будет создан новый сотрудник.';
}
