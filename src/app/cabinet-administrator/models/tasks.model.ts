export class TasksModel {
  createdOn: Date;
  organizationId: string;
  organizationName: string;
  type: number;
  status: number;
  period: {
    start: Date;
    end: Date;
  };
}

export class DataTasksModel {
  data: TasksModel[];
}
