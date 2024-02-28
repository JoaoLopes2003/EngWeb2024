# Processar o dataset de filmes americanos:

Neste trabalho, utilizou-se os dados referentes a filmes americanos, disponibilizados num ficheiro json não normalizado e com erros, contendo informação relativa a atores, filmes e gêneros de filmes.

Neste pretende-se porceder à normalização dos dados e sua correção, facilitando depois a geração dinâmica das páginas com a ajuda de um servidor em javascript que responde a pedidos http do tipo GET.

Assim, o servidor deverá ser capaz de responder às seguintes rotas com ajuda de um json server:

- **GET /filmes**

    Retorna uma página com uma listagem dos filmes disponíveis. Os filmes são apresentados com links embutidos para suas páginas individuais.

- **GET /filmes/\<filmeID\>**

    Retorna a página do filme correspondente ao *\<filmeID\>*. Esta página apresenta atributos do filme, como elenco, gênero, entre outros.

- **GET /atores**

    Retorna uma página com uma listagem dos atores presentes nos filmes. Os atores são listados com links embutidos para suas páginas individuais.

- **GET /atores/\<atorID\>**

    Retorna a página do ator correspondente ao *\<atorID\>*. Esta página fornece informações específicas sobre o ator.

- **GET /generos**

    Retorna uma página com uma listagem dos gêneros disponíveis nos filmes.

- **GET /generos/\<generoX\>**

    Retorna uma página com os filmes do gênero especificado por *\<generoX\>*.