import { Album, Board, Dahira, DahiraEvent, PageContent } from '../models';

/** Tout le contenu public d'un dahira. V1 : JSON de démo ; ensuite : Supabase. */
export interface TenantBundle {
  dahira: Dahira;
  events: DahiraEvent[];
  albums: Album[];
  board: Board;
  content: PageContent;
}

type Loader = () => Promise<TenantBundle>;

const moutahabina: Loader = async () => {
  const [dahira, events, albums, board, content] = await Promise.all([
    import('../../../assets/mock/tenant.json'),
    import('../../../assets/mock/events.json'),
    import('../../../assets/mock/albums.json'),
    import('../../../assets/mock/board.json'),
    import('../../../assets/mock/content.json'),
  ]);
  return {
    dahira: dahira.default as unknown as Dahira,
    events: events.default as DahiraEvent[],
    albums: albums.default as unknown as Album[],
    board: board.default as Board,
    content: content.default as PageContent,
  };
};

/** Sources de démo, par slug. Les JSON sont embarqués dans le bundle (compatibles SSR). */
export const MOCK_SOURCES: Record<string, Loader> = { moutahabina };
