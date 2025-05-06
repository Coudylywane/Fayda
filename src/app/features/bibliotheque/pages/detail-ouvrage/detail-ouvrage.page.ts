/**
* @author Dr_EPL
* @summary "dolnickenzanza@gmail.com"
* @copyright 2025
*/

import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BooksService } from '../../services/books.service';
import { Book } from '../../model/bibliotheque.model';

@Component({
  selector: 'app-detail-ouvrage',
  templateUrl: './detail-ouvrage.page.html',
  styleUrls: ['./detail-ouvrage.page.scss'],
  standalone: false
})
export class DetailOuvragePage implements OnInit {
  book: Book | undefined;
  isFavorite: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private booksService: BooksService
  ) { }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.book = this.booksService.getBookById(+id);
    }
  }

  goBack() {
    this.router.navigate(['tabs/bibliotheque']);
  }

  toogleMark() {
    this.isFavorite = !this.isFavorite;
    console.log('books: ', this.book);
  }

  goToRead() {
    if (this.book) {
      this.router.navigate(['bibliotheque/lire-ouvrage/:id', this.book.id]);
    }
  }
}
