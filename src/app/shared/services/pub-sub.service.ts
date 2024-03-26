import {Injectable, OnDestroy} from "@angular/core";
import {Observable, PartialObserver, Subject, Subscription} from "rxjs";

@Injectable({providedIn: "root"})
export class PubSubService implements OnDestroy {
  private subjects: { [key: string]: Subject<any> } = {};
  private hasOwnProp = {}.hasOwnProperty;

  constructor() {
  }

  public publishEvent(name: string, data: any | null = null): void {
    const fnName = this.createName(name);
    this.subjects[fnName] || (this.subjects[fnName] = new Subject());
    this.subjects[fnName].next(data);
  }

  public subscribe(name: string, handler: (value: any) => void) : Subscription {
    const fnName = this.createName(name);
    const subject = this.subjects[fnName] || (this.subjects[fnName] = new Subject());
    return subject.subscribe(handler);
  }

  private createName(name: string): string {
    return '$' + name;
  }

  ngOnDestroy(): void {
    const subjects = this.subjects;
    for (const prop in subjects) {
      if (this.hasOwnProp.call(subjects, prop)) {
        subjects[prop].unsubscribe();
      }
    }

    this.subjects = {};
  }

}
