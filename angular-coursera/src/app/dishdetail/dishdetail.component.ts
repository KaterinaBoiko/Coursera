import { Component, OnInit, ViewChild, Inject } from '@angular/core';
import { Dish } from '../shared/dish';
import { DishService } from '../services/dish.service';
import { Params, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { switchMap } from 'rxjs/operators';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Comment } from '../shared/comment';
import { visibility, flyInOut, expand } from '../animations/app.animation';

@Component({
    selector: 'app-dishdetail',
    templateUrl: './dishdetail.component.html',
    styleUrls: ['./dishdetail.component.css'],
    host: {
        '[@flyInOut]': 'true',
        'style': 'display: block'
    },
    animations: [
        visibility(),
        flyInOut(),
        expand()
    ]
})
export class DishdetailComponent implements OnInit {

    @ViewChild('fform') commentFormDirective;
    commentForm: FormGroup;
    comment: Comment;
    dish: Dish;
    dishIds: string[];
    prev: string;
    next: string;
    preComment: Comment;
    errMess: string;
    dishCopy: Dish;
    visibility = 'shown';

    formErrors = {
        'author': '',
        'comment': ''
    };

    validationMessages = {
        'author': {
            'required': 'Author name is required.',
            'minlength': 'Author name must be at least 2 characters long.'
        },
        'comment': {
            'required': 'Comment is required.'
        }
    };

    constructor(private dishService: DishService,
        private route: ActivatedRoute,
        private location: Location,
        private fb: FormBuilder,
        @Inject('BaseURL') private BaseURL) {
    }

    ngOnInit() {
        this.createForm();

        this.dishService.getDishIds()
            .subscribe(dishIds => this.dishIds = dishIds);
        this.route.params
            .pipe(switchMap((params: Params) => {
                this.visibility = 'hidden';
                return this.dishService.getDish(params['id']);
            }))
            .subscribe(dish => {
                this.dish = dish;
                this.dishCopy = dish;
                this.setPrevNext(dish.id);
                this.visibility = 'shown';
            },
                errmess => this.errMess = <any>errmess);
    }

    setPrevNext(dishId: string) {
        const index = this.dishIds.indexOf(dishId);
        this.prev = this.dishIds[(this.dishIds.length + index - 1) % this.dishIds.length];
        this.next = this.dishIds[(this.dishIds.length + index + 1) % this.dishIds.length];
    }

    goBack(): void {
        this.location.back();
    }

    createForm() {
        this.commentForm = this.fb.group({
            author: ['', [Validators.required, Validators.minLength(2)]],
            rating: 5,
            comment: ['', Validators.required]
        });

        this.commentForm.valueChanges
            .subscribe(data => this.onValueChanged(data));

        this.onValueChanged();
    }

    onValueChanged(data?: any) {
        if (this.commentForm.get('author').valid && this.commentForm.get('comment').valid)
            this.preComment = this.commentForm.value;
        else this.preComment = null;
        if (!this.commentForm) return;
        const form = this.commentForm;
        for (const field in this.formErrors) {
            if (this.formErrors.hasOwnProperty(field)) {
                this.formErrors[field] = '';
                const control = form.get(field);
                if (control && control.dirty && !control.valid) {
                    const messages = this.validationMessages[field];
                    for (const key in control.errors) {
                        if (control.errors.hasOwnProperty(key)) {
                            this.formErrors[field] += messages[key] + ' ';
                        }
                    }
                }
            }
        }
    }

    onSubmit() {
        this.comment = this.commentForm.value;
        this.comment.date = new Date().toISOString();
        this.dishCopy.comments.push(this.comment);
        this.dishService.putDish(this.dishCopy)
            .subscribe(
                dish => {
                    this.dish = dish;
                    this.dishCopy = dish;
                },
                errmess => {
                    this.dish = null;
                    this.dishCopy = null;
                    this.errMess = <any>errmess;
                })
        console.log(this.comment);
        this.commentFormDirective.resetForm();
        this.commentForm.reset({
            author: '',
            rating: 5,
            comment: ''
        });
    }
}
