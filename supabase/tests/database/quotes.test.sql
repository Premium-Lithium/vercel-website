begin;
select plan(1); -- only one statement to run

SELECT has_column(
    'quote',
    'installerId',
    'installerId should exist'
);

select * from finish();
rollback;