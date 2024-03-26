import { Component, OnInit, Input } from '@angular/core';
import { PhotosService } from 'src/app/services/photos.service';

@Component({
  selector: 'app-photo-block',
  templateUrl: './photo-block.component.html',
  styleUrls: ['./photo-block.component.scss'],
})
export class PhotoBlockComponent implements OnInit {
  @Input() photos: string[];
  PhotosBaseUrl = this.photosService.PhotosBaseUrl;
  constructor(private photosService: PhotosService) {}
  ngOnInit(): void {}
}
