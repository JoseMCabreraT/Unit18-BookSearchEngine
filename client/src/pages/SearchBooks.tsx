import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import { useLazyQuery, useMutation, gql } from '@apollo/client';
import {
  Container,
  Col,
  Form,
  Button,
  Card,
  Row
} from 'react-bootstrap';

import Auth from '../utils/auth';
import { saveBook, searchGoogleBooks } from '../utils/API';
import { saveBookIds, getSavedBookIds } from '../utils/localStorage';
import type { Book } from '../models/Book';
import type { GoogleAPIBook } from '../models/GoogleAPIBook';

const SEARCH_BOOKS = gql`
  query SearchBooks($query: String!) {
    searchBooks(query: $query) {
      bookId
      title
      authors
      description
      image
    }
  }
`;

const SAVE_BOOK = gql`
  mutation SaveBook($book: BookInput!) {
    saveBook(book: $book) {
      username
      savedBooks {
        bookId
        title
        authors
        description
        image
      }
    }
  }
`;

const SearchBooks = () => {
  
  const [searchedBooks, setSearchedBooks] = useState<Book[]>([]);
  
  const [searchInput, setSearchInput] = useState('');

  
  const [savedBookIds, setSavedBookIds] = useState(getSavedBookIds());

  const [searchBooks] = useLazyQuery(SEARCH_BOOKS, {
    fetchPolicy: 'network-only',
    onCompleted: (data) => {
      setSearchedBooks(data.searchBooks);
    },
    onError: (error) => {
      console.error('Error fetching books:', error);
    }
  });

  const [saveBook] = useMutation(SAVE_BOOK, {
    onCompleted: (data) => {
      setSavedBookIds([...savedBookIds, ...data.saveBook.savedBooks.map((b: Book) => b.bookId)]);
    },
    onError: (error) => {
      console.error('Error saving book:', error);
    }
  });


  const handleFormSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      await searchBooks({ variables: { query: searchInput } });
    } catch (error) {
      console.error("GraphQL Search Error:", error);
    }
  };
  
  const handleSaveBook = async (bookId: string) => {
    // find the book in `searchedBooks` state by the matching id
    const bookToSave: Book = searchedBooks.find((book) => book.bookId === bookId)!;
    if (!bookToSave) return;
    // get token
    const token = Auth.loggedIn() ? Auth.getToken() : null;

    if (!token) return;
    await saveBook({ variables: { book: bookToSave } });
  };
    

  return (
    <>
      <div className="text-light bg-dark p-5">
        <Container>
          <h1>Search for Books!</h1>
          <Form onSubmit={handleFormSubmit}>
            <Row>
              <Col xs={12} md={8}>
                <Form.Control
                  name='searchInput'
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  type='text'
                  size='lg'
                  placeholder='Search for a book'
                />
              </Col>
              <Col xs={12} md={4}>
                <Button type='submit' variant='success' size='lg'>
                  Submit Search
                </Button>
              </Col>
            </Row>
          </Form>
        </Container>
      </div>

      <Container>
        <h2 className='pt-5'>
          {searchedBooks.length
            ? `Viewing ${searchedBooks.length} results:`
            : 'Search for a book to begin'}
        </h2>
        <Row>
          {searchedBooks.map((book) => {
            return (
              <Col md="4" key={book.bookId}>
                <Card border='dark'>
                  {book.image ? (
                    <Card.Img src={book.image} alt={`The cover for ${book.title}`} variant='top' />
                  ) : null}
                  <Card.Body>
                    <Card.Title>{book.title}</Card.Title>
                    <p className='small'>Authors: {book.authors}</p>
                    <Card.Text>{book.description}</Card.Text>
                    {Auth.loggedIn() && (
                      <Button
                        disabled={savedBookIds?.some((savedBookId: string) => savedBookId === book.bookId)}
                        className='btn-block btn-info'
                        onClick={() => handleSaveBook(book.bookId)}>
                        {savedBookIds?.some((savedBookId: string) => savedBookId === book.bookId)
                          ? 'This book has already been saved!'
                          : 'Save this Book!'}
                      </Button>
                    )}
                  </Card.Body>
                </Card>
              </Col>
            );
          })}
        </Row>
      </Container>
    </>
  );
};

export default SearchBooks;
