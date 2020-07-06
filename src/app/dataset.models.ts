export interface DatasetRecord {
  violation_id: string;
  inspection_id: string;
  violation_category: string;
  violation_date: string;
  violation_date_closed: string;
  violation_type: string;
}

export class DatasetRecord implements DatasetRecord {
  constructor(
    public violation_id = '',
    public inspection_id = '',
    public violation_category = '',
    public violation_date = '',
    public violation_date_closed = '',
    public violation_type = ''
  ) {}
}
