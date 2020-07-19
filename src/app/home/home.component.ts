import { Component, OnInit, ViewChild } from '@angular/core';
import { ApiService } from '../api.service';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';


export interface Message {
  "dateCompleted"?: string;
  "direction": 0 | 1; // 0 is inbound, 1 is outbound
  "body": string;
  "status"?: string; // 'delivered' 'queued' 'etc'
}

export interface Seeker {
  "_id": string,
  "firstName": string,
  "lastName": string,
  "lastMessageDate": string,
  "messages": Message[]
}

export interface APIObject {
  "seekers": Seeker[]
}

export interface TableRow {
  name: string,
  message: Message,
  dateCompleted: Date
}

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})

export class HomeComponent implements OnInit {
  apiLength = 0;
  apiElems = []
  displayedColumns: string[] = ['name', 'message', 'date'];
  dataSource: MatTableDataSource<TableRow>;
  API_URL = "https://x17hs8niwh.execute-api.us-east-1.amazonaws.com/dev/demo/get-seekers"

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  constructor(private apiService: ApiService) { }


  ngOnInit() {
    this.getData();
  }

  getData() {
    this.apiService.get(this.API_URL).subscribe((data: APIObject) => {
      this.parseData(data);
      this.apiLength = this.apiElems.length;
      this.dataSource = new MatTableDataSource(this.apiElems)
      this.dataSource.sort = this.sort;
      this.dataSource.paginator = this.paginator;
      this.dataSource.sortingDataAccessor
      this.dataSource.sortingDataAccessor = (item, property) => {

        switch (property) {
          case 'date': return new Date(item.dateCompleted);
          default: return item[property];
        }
      };
    })
  }


  parseData(data: APIObject){
    data.seekers.forEach( seeker => {
        seeker.messages.forEach(message => {

          this.apiElems.push({
            name: seeker.firstName + " " + seeker.lastName,
            message: message.body,
            dateCompleted: new Date(message.dateCompleted)
          })


        });
    })
  }

  displayDate(date: Date): string{
    return date.toLocaleDateString() + " " + date.toLocaleTimeString();
  }

  shouldTruncate(msg: string){
    const max = 250;
    return (msg.length > max)
  }

  truncateText(msg: string): string{
    const maxLength = 250;
    if(this.shouldTruncate(msg)){return msg.substring(0,maxLength) + "..."}
    return msg;
  }

}
