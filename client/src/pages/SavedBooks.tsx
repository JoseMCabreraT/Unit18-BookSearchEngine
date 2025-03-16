import { useState, useEffect } from 'react';
import { Container, Card, Button, Row, Col } from 'react-bootstrap';
import { useQuery, useMutation, gql } from '@apollo/client';


import { getMe, deleteBook } from '../utils/API';
import Auth from '../utils/auth';
import { removeBookId } from '../utils/localStorage';
import type { User } from '../models/User';

const GET_BOOKS = gql`
  query GetBooks {
    me {
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

const DELETE_BOOK = gql`
  mutation DeleteBook($bookId: String!) {
    deleteBook(bookId: $bookId) {
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


const SavedBooks = () => {
  
  const { loading, data } = useQuery(GET_BOOKS, {
    skip: !Auth.loggedIn(), // 
  });

  const [deleteBook] = useMutation(DELETE_BOOK, {
    update(cache, { data: { deleteBook } }) {
      cache.writeQuery({
        query: GET_BOOKS,
        data: { me: deleteBook },
      });
    },
  });

  const handleDeleteBook = async (bookId: string) => {
    try {
      await deleteBook({ variables: { bookId } });
      removeBookId(bookId);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <h2>LOADING...</h2>;

  const userData = data?.me || { username: '', savedBooks: [] };

  

  return (
    <>
      <div className='text-light bg-dark p-5'>
        <Container>
          {userData.username ? (
            <h1>Viewing {userData.username}'s saved books!</h1>
          ) : (
            <h1>Viewing saved books!</h1>
          )}
        </Container>
      </div>
      <Container>
        <h2 className='pt-5'>
          {userData.savedBooks.length
            ? `Viewing ${userData.savedBooks.length} saved ${
                userData.savedBooks.length === 1 ? 'book' : 'books'
              }:`
            : 'You have no saved books!'}
        </h2>
        <Row>
        {userData.savedBooks.map((book: { bookId: string; title: string; authors?: string[]; description: string; image?: string }) => {
            return (
              <Col md='4'>
                <Card key={book.bookId} border='dark'>
                  {book.image ? (
                    <Card.Img
                      src={book.image}
                      alt={`The cover for ${book.title}`}
                      variant='top'
                    />
                  ) : null}
                  <Card.Body>
                    <Card.Title>{book.title}</Card.Title>
                    <p className='small'>Authors: {book.authors}</p>
                    <Card.Text>{book.description}</Card.Text>
                    <Button
                      className='btn-block btn-danger'
                      onClick={() => handleDeleteBook(book.bookId)}
                    >
                      Delete this Book!
                    </Button>
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

export default SavedBooks;
