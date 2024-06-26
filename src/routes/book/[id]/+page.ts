export function load({
	params
}: {
	params: {
		id: string;
	};
}) {
	return {
		bookId: params.id
	};
}

export const ssr = false;
