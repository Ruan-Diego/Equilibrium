export type IntroSlideId =
  | 'welcome'
  | 'scores'
  | 'areas'
  | 'colors'
  | 'history'
  | 'ready'

export type IntroSlide = {
  id: IntroSlideId
  title: string
  body: string
}

export const introSlides: readonly IntroSlide[] = [
  {
    id: 'welcome',
    title: 'Olá, este é o Equilibrium',
    body: 'Já sentiu que você deu muita atenção pra algumas áreas da sua vida e esqueceu de outras importantes?',
  },
  {
    id: 'scores',
    title: 'Dê notas pra todas as áreas da sua vida!',
    body: 'De forma simples, aumente ou diminua as notas pra cada área de acordo com os seus critérios',
  },
  {
    id: 'areas',
    title: 'Monte o mapa da sua vida',
    body: 'Crie áreas como família, trabalho, amigos, academia, grupos de amigos, relacionamentos específicos e decida qual a sua nota pra cada área da sua vida',
  },
  {
    id: 'colors',
    title: 'As cores te guiam com carinho',
    body: 'A ideia desse aplicativo é te ajudar visualmente, pra que você sempre lembre do que considera importante',
  },
  {
    id: 'history',
    title: 'Um olhar para o todo e para o caminho',
    body: 'Na home, você vê se a vida está equilibrada. No histórico, acompanha como cada área evoluiu nos últimos dias.',
  },
  {
    id: 'ready',
    title: 'Pronto para equilibrar sua vida?',
    body: 'Crie suas primeiras áreas e registre como está a atenção hoje. Com calma, com Equilibrium',
  },
] as const

export const INTRO_SLIDE_COUNT = introSlides.length
