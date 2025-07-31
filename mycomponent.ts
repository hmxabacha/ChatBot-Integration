import { Component } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import * as XLSX from 'xlsx';


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './mycomponent.html',
  styleUrls: ['./mycomponent.css']
})
export class AppComponent {
  data = '';
  question = '';
  response = '';
  error = '';
  loading = false;

  private apiKey = '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';

  constructor(private http: HttpClient) {
    console.log("ChatGPT Q&A component initialized");
  }

  // For File .txt

  // onFileSelected(event: Event): void {
  //   const input = event.target as HTMLInputElement;
  //   const file = input.files?.[0];

  //   if (file) {
  //     const reader = new FileReader();
  //     reader.onload = () => {
  //       this.data = reader.result as string;
  //     };
  //     reader.readAsText(file);
  //   }
  // }

  // For Exel .xlsx

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e: any) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: 'array' });

      const firstSheet = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheet];

      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      this.data = JSON.stringify(jsonData); // You can process this as needed
    };
    reader.readAsArrayBuffer(file); // ✅ Use ArrayBuffer for binary Excel files
  }

  ask() {
    this.loading = true;

    const body = {
      model: 'qwen/qwen3-coder:free', // or any model from https://openrouter.ai/docs#available-models
      messages: [
        { role: 'system', content: 'You are a helpful assistant.' },
        { role: 'user', content: `Data:\n${this.data}\n\nQuestion:\n${this.question}` }
      ]
    };

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.apiKey}`,
      'HTTP-Referer': 'http://localhost:4200',  // or your domain if hosted
      'X-Title': 'MyAngularApp',
      'Content-Type': 'application/json'
    });

    this.http.post<any>('https://openrouter.ai/api/v1/chat/completions', body, { headers })
      .subscribe({
        next: (res) => {
          this.response = res.choices[0].message.content;
          this.loading = false;
        },
        error: (err) => {
          console.error(err);
          this.response = 'Something went wrong. Check the console.';
          this.loading = false;
        }
      });
  }


  // Optional: Clear the response when data or question changes
  onInputChange() {
    if (this.response) {
      this.response = '';
    }
    if (this.error) {
      this.error = '';
    }
  }
}
