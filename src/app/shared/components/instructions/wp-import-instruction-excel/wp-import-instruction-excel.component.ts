import { Component } from '@angular/core';

@Component({
  selector: 'wp-employee-import-instruction',
  templateUrl: './wp-import-instruction-excel.component.html',
  styleUrls: ['./wp-import-instruction-excel.component.scss'],
})
export class WpEmployeeImportInstructionComponent {
  instructionTitle = 'Инструкция по импорту сотрудников из Excel';
  instructionDescription = 'Ознакомьтесь с требованиями перед импортом файла';
  instructionItems = [
    {
      content: 'Требования к файлу',
      subItems: [
        { content: 'файл должен соответствовать формату xls/xlsx' },
        {
          content:
            'файл должен содержать только поля с заголовками (обязательные поля отмечены *)',
          subItems: [
            {
              content: 'Отдел',
              isRequired: true,
            },
            { content: 'Фамилия', isRequired: true },
            { content: 'Имя', isRequired: true },
            { content: 'Отчество' },
            { content: 'ИИН' },
            { content: 'Email' },
            {
              content:
                'Дата рождения. Значения в поле "Дата рождения" должны соответствовать формату ДД. ММ. ГГГГ',
            },
          ],
        },
        {
          content: 'значения в полях файла не должны превышать допустимые',
          subItems: [
            { content: 'Отдел: 100 символов' },
            { content: 'Фамилия/Имя/Отчество: 50 символов' },
            { content: 'Email: 192 символа' },
            {
              content:
                'Дата рождения. Значения в поле "Дата рождения" должны соответствовать формату ДД. ММ. ГГГГ',
            },
          ],
        },
        {
          content:
            'в файле не должно быть дублирующих строк по полю "ИИН"/"Email"',
        },
      ],
    },
    {
      imageSrc: 'assets/image/example-excel.png',
      imageAlt: 'Background Image',
      imageCaption: 'Пример содержимого файла',
    },
  ];
  footerNote =
    'Примечание: если в системе по наименованию будет найден существующий отдел, сотрудник добавится к нему. При отсутствии совпадений будет создан новый отдел';
}
