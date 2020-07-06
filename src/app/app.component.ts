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

        this.dataSource = new MatTableDataSource(this.records);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
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

    this.solveChallenge();

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

  solveChallenge = () => {
    for (const category of this.categoryList) {
      const recordsForCurrentCategory = this.csvArr.filter((record) => {
        return record.violation_category === category;
      });

      const categoryCounter = recordsForCurrentCategory.length;

      const earlyViolationDate = new Date(
        Math.min.apply(
          null,
          recordsForCurrentCategory.map((record) => {
            return new Date(record.violation_date);
          })
        )
      );

      const lateViolationDate = new Date(
        Math.max.apply(
          null,
          recordsForCurrentCategory.map((record) => {
            return new Date(record.violation_date);
          })
        )
      );

      this.categoryViolations[category] = categoryCounter;
      this.categoryViolationDatesEarly[category] = earlyViolationDate;
      this.categoryViolationDatesLate[category] = lateViolationDate;
    }

    Object.keys(this.categoryViolations).forEach((key) => {
      this.categoryViolationsArr.push({
        category: key,
        violations: this.categoryViolations[key],
      });
    });

    Object.keys(this.categoryViolationDatesEarly).forEach((key) => {
      this.categoryViolationDatesEarlyArr.push({
        category: key,
        date: this.categoryViolationDatesEarly[key].toDateString(),
      });
    });

    Object.keys(this.categoryViolationDatesLate).forEach((key) => {
      this.categoryViolationDatesLateArr.push({
        category: key,
        date: this.categoryViolationDatesLate[key].toDateString(),
      });
    });
  };

  applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }
}
