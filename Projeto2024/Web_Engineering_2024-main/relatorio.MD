# Plataforma de Gestão e Disponibilização de Recursos Educativos

### Trabalho realizado no âmbito da disciplina de Engenharia Web


#### Realizado por:
- <b>A100594</b>: João Manuel Machado Lopes.
- <b>A100693:</b> Luís Vitor Barros.
- <b>A100665</b>: Tiago Nuno de Magalhães Teixeira.



## Estruturas de dados

Focamo-nos em establecer os tipos de dados necessários para o desenvolvimento da nossa aplicação da forma mais simples, eficiente e organizada possível. Dito isto utilizamos então as seguintes estruturas de dados:

### Tipo de Recurso

- **_id**: [String] - Nome do tipo de recurso.
- **mandatoryFiles**: [List] - Lista de ficheiros obrigatórios, que devem estar contidos em qualquer zip do respetivo tipo de recurso.


### User

- **_id**: [String] - Username do User.
- **nome**: [String] - Nome do User.
- **email**: [String] - Email do utilizador.
- **cargo**: [String] - Cargo atual do utilizador, no sistema (Ex: administrador, utilizador).
- **dataRegisto**: [String] - Data e hora do registo do user.
- **password**: [String] - Hash da password do user.


### Recurso 


- **_id**: [String] - UID do recurso.
- **tipo**: [String] - Tipo do recurso (ex: livro, artigo, app).
- **dataCriacao**: [String] - Data de criação do recurso.
- **dataRegisto**: [String] - Data e hora de registro do recurso.
- **visibilidade**: [String] - Visibilidade do recurso (público ou privado).
- **titulo**: [String] - Título do recurso.
- **subtitulo**: [String] - Subtítulo do recurso.
- **autor**: [String] - Autor do recurso.

- **comentários** [List] - Lista de comentários acerca do recurso.
    - **usuario** [String] - User que comentou.
    - **comentario** [String] - Mensagem que foi escrita no corpo do comentário.
    - **data** [String] - Data em que o comentário foi realizado.
    - **classificacao** [Number] - Classificação atribuída pelo user ao recurso.
- **ranking**: 
    - **estrelas**: [Float] - Número de estrelas recebidas, numa métrica de 0 a 5.
    - **numero_avaliacoes**: [Int] Número de avaliações totais recebidas, até ao momento.
- **pathRecurso**:[String] - Caminho para o zip que contém os ficheiros associados a este recurso.
- **notificações**: [List] -  Lista de usuários que já foram notificados
    - **usuario**: [String] - usuário que já foi notificado


## Funcionalidades

### Autenticação e proteção de rotas

De modo a obter maior segurança nas diferentes rotas e operações, é necessário criar um sistema de autenticação. Para este efeito, usamos, de acordo com o que foi visto nas aulas, a biblioteca **"jsonwebtoken"** para tratar de tokens e encriptação, sem a nossa intervenção manual. Estes tokens, são gerados através dos dados das contas dos utilizadores, seguindo o modelo dos users.
Além disso, ainda utilizamos cookies e criação de sessões.

Desta forma, podemos proteger deteminadas rotas, podendo estas apenas ser acedidas após ser realizado login no sistema. Além disso, existem determinadas operações que estão restringidas a determinados utilizadores. Por exemplo, apenas os administradores podem visualizar todos os recursos (independente de serem públicos ou privados), adicionar novos tipos de recursos ou editar os já existentes, e realizar operações de importação de dados e exportação de dados. Por sua vez, cada utilizador só pode alterar os seus próprios recursos e visualizar os dos outros caso estes sejam privados. Da mesma forma, cada utilizador só pode adicionar comentários e classificações aos recursos dos outros utilizadores e nunca aos seus próprios.

### Manipulação dos Recursos (API)

 A criação da API segue aquilo que foi realizado durante as aulas práticas e ensinado nas teóricas, pelo que, baseados nas estruturas descritas previamente, criamos 3 modelos e 3 controladores.
  As rotas estão, também, separadas por cada um destas três estruturas por nós definidas.

 **Listagem**: Um user é capaz de listar todos os recursos, com ou sem a aplicação de filtros.

**Consulta**: É possível consultar um recurso, através do seu UID. Caso este seja privado,apenas o seu autor  e os administradores podem aceder ao mesmo.

**Criação**: Um utilizador consegue criar um recurso manualmente, e existe uma interface visualmente acessível para tal. De notar que certas verificações são feitas, como se o recurso contém todos os ficheiros que deveria ter, como está estabelecido nos seus **mandatory_files**.

**Atualização**: Um user consegue atualizar um recurso através do seu UID, sendo que qualquer user pode adiconar comentários (menos o autor do recurso), mas apenas o autor do recurso **ou um admin** podem alterar os campos da estrutura do mesmo.

**Remoção**: Novamentem apenas o autor do recurso **ou um admin** podem remover recursos da base de dados.

**Avaliação**: Qualquer utilizador pode adicionar um comentário e uma avaliação a um recurso público do sistema.


### Web Views

No que toca à fase de mostrar os conteúdos html com as informações provenientes da API, desenvolvemos algumas páginas (views) em **pug**. Para além daquelas que já se esperaria, pela necessidade de corresponder as ações da API, como apagar, registar e editar recursos, a páginas que sejam legíveis para o utilizador final, desenvolvemos ainda a página de login e de registo, associadas ao fator autenticação que tivemos em conta para o projeto, e ainda uma página "recursoPorTipo", que, tal como o nome indica, lista todos os recursos, agrupando-os pelos seus tipos. Importante salientar, que o servidor ao gerar as páginas, tem em atenção que certos elementos das mesmas são apenas para administradores e, por tanto, existem expressões condicionais no código das páginas pug.

### Importação/Exportação de Dados

É importante mencionar, que os admins têm ainda a possibilidade de baixar todos os dados (coleções de utilizadores, recursos e tipos de recursos, e os ficheiros dos recursos), recebendo um ficheiro zip que contem um ficheiro dados.json que contem todas as coleções de dados, e N ficheiros .zip que correspondem a todos os zips dos recursos. Relativamente à importação de dados, o administrador submete um ficheiro zip com estrutura obrigatoriamente igual à do zip que recebe quando exporta os dados, e o servidor responsabiliza-se por inserir os dados nas respetivas estruturas e diretorias.

## Docker 

O projeto foi realizado para rodar num container Docker. Para facilitar este processo, criamos um ficheiro "docker-compose.yml" e um "Dockerfile", cuja utilização está explicada no **README** do projeto.

No ficheiro compose, podemos verificar todos os containers a serem criados. O **mongo-seed** servirá para importar os datasets para o mongodb, criando assim a base de dados e as respetivas coleções. Após a importação dos dados, criamos outro container **mongodb**, que servirá de motor da base de dados , com portas standard, a ser utilizado pelo sistema. Por fim, **reccursos-web** têm a sua imagem criada através do *Dockerfile* presente na pasta "server", que servirá como servidor para o nosso serviço web. 
 
No *Dockerfile* mencionado anteriormente, fazemos uma cópia da imagem **Node**, expomos a porta 15001, instalamos todos os módulos dependentes e por fim põe em execução o serviço web.

## Conclusão

Após realizar este trabalho, concluímos que mestramos as nossas capacidades no que toca à criação de APIs e modelos para as servir, bem como noções de autenticação, normalização e modelação de dados, tópicos que foram lecionados ao longo do semestre.
