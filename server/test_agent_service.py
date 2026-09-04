
import asyncio

from repath_agent.services.agent_service import send_agent_message


async def main():
    result = await send_agent_message(
        "My scholarship application was rejected because "
        "the submitted documentation was incomplete."
    )

    print(result)


asyncio.run(main())