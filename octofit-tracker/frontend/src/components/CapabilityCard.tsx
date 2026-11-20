import { useEffect, useState, type ReactNode } from 'react';

type Props<T> = {
  title: string;
  description: string;
  load: () => Promise<T>;
  emptyMessage: string;
  isEmpty: (data: T) => boolean;
  children: (data: T) => ReactNode;
};

type RequestState<T> =
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; message: string };

export function CapabilityCard<T>({ title, description, load, emptyMessage, isEmpty, children }: Props<T>) {
  const [request, setRequest] = useState<RequestState<T>>({ status: 'loading' });

  useEffect(() => {
    let active = true;
    setRequest({ status: 'loading' });
    load()
      .then((data) => {
        if (active) setRequest({ status: 'success', data });
      })
      .catch((error: unknown) => {
        if (active) {
          setRequest({
            status: 'error',
            message: error instanceof Error ? error.message : 'Request failed',
          });
        }
      });
    return () => {
      active = false;
    };
  }, [load]);

  return (
    <section className="card h-100">
      <div className="card-body">
        <h2 className="h4">{title}</h2>
        <p>{description}</p>
        {request.status === 'loading' && <p role="status">Loading {title.toLowerCase()}...</p>}
        {request.status === 'error' && <p role="alert">Unable to load {title.toLowerCase()}: {request.message}</p>}
        {request.status === 'success' && (
          isEmpty(request.data) ? <p>{emptyMessage}</p> : children(request.data)
        )}
      </div>
    </section>
  );
}
