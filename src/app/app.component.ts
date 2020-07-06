import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';

import { HttpClient } from '@angular/common/http';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { DatasetRecord } from './dataset.models';
import { element } from 'protractor';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  encapsulation: ViewEncapsulation.None,
})
export class AppComponent implements OnInit {
  title = 'code-for-canada-challenge';

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  csvUrl = '../assets/C4C-dev-challenge-2018.csv';

  displayedColumns: string[] = [
    'violation_id',
    'inspection_id',
    'violation_category',
    'violation_date',
    'violation_date_closed',
    'violation_type',
  ];

  public records: any[] = [];

  dataSource: MatTableDataSource<DatasetRecord>;

  csvArr = [];
  categoryList = [];
  categoryViolations = {};
  categoryViolationDatesEarly = {};
  categoryViolationDatesLate = {};

  categoryViolationsArr = [];
  categoryViolationDatesEarlyArr = [];
  categoryViolationDatesLateArr = [];

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    // Reading the csv file as a http response with text (string) format

    this.http.get(this.csvUrl, { responseType: 'text' }).subscribe(
      (csvData: string) => {
        const csvRecords = csvData.split(/\r\n|\n/);

        console.warn(csvRecords[0]);

        const csvHeaders = csvRecords[0].split(',');

        this.records = this.getDataRecordsArrayFromCSVFile(
          csvRecords,
          csvHeaders.length
        );
      },
      (err) => {
        alert('Could not load the data!');
        console.error(err);
        this.records = [];
      }
    );
  }

  getDataRecordsArrayFromCSVFile(csvRecordsArray: any, headerLength: any) {
    for (let i = 1; i < csvRecordsArray.length; i++) {
      const curruntRecord = csvRecordsArray[i].split(',');

      // check if the row is valid
      if (curruntRecord.length === headerLength) {
        const csvRecord: DatasetRecord = new DatasetRecord();
        csvRecord.violation_id = curruntRecord[0].trim();
        csvRecord.inspection_id = curruntRecord[1].trim();
        csvRecord.violation_category = curruntRecord[2].trim();
        csvRecord.violation_date = curruntRecord[3].trim();
        csvRecord.violation_date_closed = curruntRecord[4].trim();
        csvRecord.violation_type = curruntRecord[5].trim();
        this.addViolationCategory(csvRecord);
        this.csvArr.push(csvRecord);
      }
    }

    return this.csvArr;
  }

  addViolationCategory = (csvRecord: DatasetRecord) => {
    if (
      !this.categoryList.find((item) =>
        item.match(csvRecord.violation_category)
      )
    ) {
      this.categoryList.push(csvRecord.violation_category);
    }
  };
}
