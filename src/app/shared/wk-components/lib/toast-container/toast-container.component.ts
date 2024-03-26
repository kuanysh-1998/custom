import {
  animate,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations';
import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnInit,
  ViewEncapsulation,
} from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { SvgComponent } from '../svg/svg.component';
import { ToastComponent } from '../toast/toast.component';
import { ToastService } from '../toast/toast.service';
import { Message } from '../toast/toast.types';

@Component({
  selector: 'wk-toast-container',
  templateUrl: './toast-container.component.html',
  animations: [
    trigger('messageState', [
      state(
        'visible',
        style({
          transform: 'translateY(0)',
          opacity: 1,
        })
      ),
      transition('void => *', [
        style({
          transform: '{{showTransformParams}}',
          opacity: 0,
        }),
        animate('{{showTransitionParams}}'),
      ]),
      transition('* => void', [
        animate('100ms', style({ opacity: 0 })),
        animate(
          '300ms',
          style({ height: 0, transform: '{{hideTransformParams}}' })
        ),
      ]),
    ]),
  ],
  standalone: true,
  imports: [CommonModule, SvgComponent, ToastComponent],
  providers: [BrowserAnimationsModule],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./toast-container.component.scss'],
})
export class ToastContainerComponent implements OnInit {
  @Input() public life = 3000;

  public messages: (Message & { id: number; remainingLife: number })[] = [];

  private _timeouts: { [key: number]: NodeJS.Timeout } = {};

  public get animations(): Record<string, unknown> {
    return {
      value: 'visible',
      params: {
        showTransformParams: 'translateY(100%)',
        hideTransformParams: 'translateY(0%)',
        showTransitionParams: '300ms ease-out',
        hideTransitionParams: '300ms ease-in',
      },
    };
  }

  constructor(
    private readonly _cdr: ChangeDetectorRef,
    private readonly _toastService: ToastService
  ) {}

  public ngOnInit(): void {
    this._toastService.messageSource.subscribe((message) => {
      this.add(message);
    });
  }

  public add(message: Message): void {
    const id = Date.now();
    const messageWithId: Message & { id: number; remainingLife: number } = {
      ...message,
      id: id,
      remainingLife: this.life,
    };
    this.messages = [...this.messages, messageWithId];
    this._startTimer(messageWithId);
    this._cdr.markForCheck();
  }

  public messageClose(id: number): void {
    this.messages = this.messages?.filter((i) => i.id !== id);
    this._cdr.detectChanges();
    clearTimeout(this._timeouts[id]);
    delete this._timeouts[id];
  }

  public mouseEnter(id: number): void {
    clearTimeout(this._timeouts[id]);
    const message = this.messages.find((m) => m.id === id);
    if (message) {
      message.remainingLife -= Date.now() - id;
    }
  }

  public mouseLeave(id: number): void {
    const message = this.messages.find((m) => m.id === id);
    if (message) {
      this._startTimer(message);
    }
  }

  private _startTimer(
    message: Message & { id: number; remainingLife: number }
  ): void {
    this._timeouts[message.id] = setTimeout(
      () => this.messageClose(message.id),
      message.remainingLife
    );
  }
}
