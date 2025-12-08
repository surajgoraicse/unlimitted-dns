import Container from "@/components/container";
import RecordsContainer from "./records-container";

const Page = async ({ params }: { params: Promise<{ id: string }> }) => {
	const { id } = await params;
	return (
		<Container>
			<RecordsContainer id={id} />
		</Container>
	);
};

export default Page;
