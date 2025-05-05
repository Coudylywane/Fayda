import { Component, Input, OnInit } from '@angular/core';
import { IonicModule, ModalController } from '@ionic/angular';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { IconButtonComponent } from "../../../../shared/components/icon-button/icon-button.component";

@Component({
  selector: 'app-comment-modal',
  templateUrl: './comment-modal.component.html',
  styleUrls: ['./comment-modal.component.scss'],
  imports: [IonicModule, CommonModule, ReactiveFormsModule, IconButtonComponent],
})
export class CommentModalComponent implements OnInit {
  @Input() activity: any;
  commentForm: FormGroup;
  
  comments = [
    {
      user: 'Abdou Diallo',
      avatar: 'assets/avatars/user1.jpg',
      text: 'Mashallah, très belle cérémonie. Je remercie tous les organisateurs.',
      time: 'Il y a 2 heures',
      likes: 24
    },
    {
      user: 'Fatou Ndiaye',
      avatar: 'assets/avatars/user2.jpg',
      text: 'L\'ambiance était extraordinaire. J\'espère pouvoir y assister l\'année prochaine inshallah.',
      time: 'Il y a 5 heures',
      likes: 18
    },
    {
      user: 'Moussa Sow',
      avatar: 'assets/avatars/user3.jpg',
      text: 'Quelqu\'un peut-il partager plus de photos de l\'événement ?',
      time: 'Il y a 1 jour',
      likes: 7
    }
  ];

  constructor(
    private modalCtrl: ModalController,
    private fb: FormBuilder
  ) {
    this.commentForm = this.fb.group({
      comment: ['', Validators.required]
    });
  }

  ngOnInit() {}

  dismissModal() {
    this.modalCtrl.dismiss();
  }

  submitComment() {
    if (this.commentForm.valid) {
      // Here you would normally send the comment to your backend
      const newComment = {
        user: 'Vous',
        avatar: 'assets/images/1.png',
        text: this.commentForm.value.comment,
        time: 'À l\'instant',
        likes: 0
      };
      
      this.comments.unshift(newComment);
      this.commentForm.reset();
    }
  }

  adjustTextareaHeight(textarea: HTMLTextAreaElement): void {
    textarea.style.height = '10px';
    textarea.style.height = textarea.scrollHeight + 'px';
  }
}