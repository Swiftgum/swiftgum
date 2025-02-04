import asyncio

from .database import Database


async def process_queue(queue_name: str, handler, timeout: int = 60):
    while True:
        job = None

        with Database() as conn:
            try:
                request = conn.execute(
                    "SELECT * FROM pgmq.read(queue_name => %s, vt => %s, qty => 1)",
                    (queue_name, timeout),
                )
                conn.commit()

                job = request.fetchone()

                # Commit the read

                if job:
                    print(job)
                    handler(job)
                else:
                    print("No jobs found")
                    # Sleep briefly if no jobs to avoid hammering the database
                    await asyncio.sleep(1)

            except Exception as e:
                print(f"Error processing {queue_name} queue: {e}")
                await asyncio.sleep(1)
