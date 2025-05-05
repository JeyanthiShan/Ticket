import { Component,ViewChild, ElementRef } from '@angular/core';
import { FormsModule, ReactiveFormsModule,FormBuilder,FormGroup, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';



@Component({
  selector: 'app-details',
  imports: [FormsModule,ReactiveFormsModule,MatFormFieldModule,MatInputModule,MatIconModule,MatButtonModule,CommonModule],
  templateUrl: './details.component.html',
  styleUrl: './details.component.css'
})
export class DetailsComponent {
  @ViewChild('ticketCanvas', { static: false }) ticketCanvas!: ElementRef<HTMLCanvasElement>;

  form: FormGroup;
  avatarImage: HTMLImageElement | null = null;
  avatarPreview: string | null = null;

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      fullName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      github: ['', Validators.required],
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      const validTypes = ['image/jpeg', 'image/png'];

      if (!validTypes.includes(file.type)) {
        alert('Only JPG and PNG files are allowed.');
        return;
      }

      const maxSize = 500 * 1024;
      if (file.size > maxSize) {
        alert('File size should be less than 500KB.');
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        const img = new Image();
        img.onload = () => {
          this.avatarImage = img;
          this.avatarPreview = reader.result as string;
        };
        img.src = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  generateTicket(): void {
    if (this.form.invalid || !this.avatarImage) {
      alert('Please complete the form and upload a valid avatar image.');
      return;
    }

    const { fullName, email, github } = this.form.value;

    const canvas = document.createElement('canvas');
    canvas.width = 700;
    canvas.height = 387;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const background = new Image();
    background.src = 'assets/pattern-ticket.svg';
    background.onload = () => {
      ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

      const logoImage = new Image();
      logoImage.src = 'assets/logo-full.svg';
      logoImage.onload = () => {
        ctx.drawImage(logoImage, 30, 30, 140, 40);

        const today = new Date();
        const dateStr = today.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        });

        ctx.fillStyle = '#ffffff';
        ctx.font = '16px Arial';
        ctx.fillText(`📅 ${dateStr} · Chennai, IN`, 30, 90);

        ctx.save();
        ctx.beginPath();
        ctx.arc(100, 220, 40, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(this.avatarImage!, 60, 180, 80, 80);
        ctx.restore();

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 18px Arial';
        ctx.fillText(`Name: ${fullName}`, 170, 200);
        ctx.fillText(`Email: ${email}`, 170, 230);
        ctx.fillText(`GitHub: @${github}`, 170, 260);

        const dataUrl = canvas.toDataURL('image/png');
        const ticketHtml = `
          <html>
            <head>
              <title>Your Ticket</title>
              <meta name="viewport" content="width=device-width, initial-scale=1.0" />
              <style>
                body {
                  margin: 0;
                  padding: 0;
                  display: flex;
                  flex-direction: column;
                  justify-content: center;
                  align-items: center;
                  min-height: 100vh;
                  background-image: url('assets/background-desktop.png');
                  background-size: cover;
                  font-family: 'Segoe UI', sans-serif;
                }
                .header-title {
                  display: flex;
                  align-items: center;
                  color: white;
                  justify-content: center;
                  margin-bottom: 20px;
                }
                .image-detail {
                  width: 120px;
                  height: auto;
                }
                .content {
                  text-align: center;
                  padding: 20px;
                  border-radius: 20px;
                }
                .content h2 {
                  font-size: 1.6rem;
                  margin: 0;
                  font-weight: 400;
                  color: white;
                  font-family: cursive;
                }
                .content h4 {
                  margin-top: 12px;
                  color: white;
                  font-family: cursive;
                }
                .ticket-img {
                  max-width: 90vw;
                  width: 600px;
                  height: auto;
                  border-radius: 10px;
                  box-shadow: 0 0 15px rgba(255, 255, 255, 0.2);
                  margin-top: 20px;
                }

                @media (max-width: 600px) {
                  .image-detail {
                    width: 100px;
                  }
                  .content h2 {
                    font-size: 1.3rem;
                  }
                  .content h4 {
                    font-size: 1rem;
                  }
                  .ticket-img {
                    width: 95vw;
                  }
                }
              </style>
            </head>
            <body>
              <div class="header-title">
                <img src="assets/logo-full.svg" alt="logo" class="image-detail" />
              </div>
              <div class="content">
                <h2>Congrats! ${fullName}!</h2>
                <h2>Your Ticket is Ready</h2>
                <h4>We've emailed your ticket to</h4>
                <h4><span style="color:orange">${email}</span> and will send updates</h4>
                <h4>in the run up to the event</h4>
              </div>
              <img src="${dataUrl}" class="ticket-img" alt="Ticket Preview" />
            </body>
          </html>
        `;

        if (window.innerWidth <= 768) {
          // Mobile: replace current document
          document.open();
          document.write(ticketHtml);
          document.close();
        } else {
          // Desktop: open in new tab
          const ticketWindow = window.open('', '_blank');
          if (ticketWindow) {
            ticketWindow.document.write(ticketHtml);
            ticketWindow.document.close();
          } else {
            alert('Popup blocked! Please allow popups for this site.');
          }
        }
      };
    };
  }  
}
function drawText() {
  throw new Error('Function not implemented.');
}

