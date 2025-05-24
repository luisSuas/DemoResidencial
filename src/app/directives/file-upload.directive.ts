import {
  Directive,
  EventEmitter,
  Output,
  HostListener,
  HostBinding,
} from '@angular/core';
@Directive({
  selector: '[appDragDropFileUpload]',
  standalone: true
})
export class DragDropFileUploadDirective {
  @Output() fileDropped = new EventEmitter<FileList>();
  @HostBinding('style.background-color') private background = 'var(--ion-background-color)';
  // Dragover Event
  @HostListener('dragover', ['$event']) dragOver(event: any) {
    event.preventDefault();
    event.stopPropagation();
    this.background = 'var(--ion-color-light)';
  }
  // Dragleave Event
  @HostListener('dragleave', ['$event']) public dragLeave(event: any) {
    event.preventDefault();
    event.stopPropagation();
    this.background = 'var(--ion-background-color)';
  }
  // Drop Event
  @HostListener('drop', ['$event']) public drop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.background = 'var(--ion-color-medium)';
    if (event.dataTransfer) {
      const files = event.dataTransfer.files;
      if (files.length > 0) {
        this.fileDropped.emit(files);
      }
    }
  }
}