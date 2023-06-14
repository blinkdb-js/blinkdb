import { Listbox, Transition } from '@headlessui/react';
import { TbBrandTypescript, TbBrandReact } from "react-icons/tb";

const ChevronUpDownIcon = (props: { className: string }) => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 15L12 18.75 15.75 15m-7.5-6L12 5.25 15.75 9" />
    </svg>
  );
}

const CheckIcon = (props: { className: string }) => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
    </svg>
  );
}

const frameworks = {
  '': {
    name: "Typescript",
    href: "/docs/reference/",
    icon: <TbBrandTypescript className='w-6 h-6 text-blue-700 dark:text-blue-400' />
  },
  'react': {
    name: "React",
    href: "/docs/reference/react",
    icon: <TbBrandReact className='w-6 h-6 text-cyan-500 dark:text-cyan-400' />
  }
} as const;

export type FrameworkId = keyof typeof frameworks;

export const FrameworkSelect = (props: { frameworkId?: FrameworkId, dark?: boolean, className?: string }) => {
  const selectedFramework = frameworks[props.frameworkId ?? ''];
  const bg = props.dark ? 'bg-gray-200 dark:bg-gray-700' : 'bg-gray-100 dark:bg-gray-800';

  return (
    <Listbox value={props.frameworkId ?? ''}>
      <Listbox.Button className={`relative w-44 rounded-lg ${bg} py-2 pl-3 text-left outline-none text-sm font-bold ${props.className ?? ''}`}>
        <span className="truncate flex items-center gap-2">{selectedFramework.icon} {selectedFramework.name}</span>
        <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
          <ChevronUpDownIcon
            className="h-6 w-6 text-gray-400 dark:text-gray-500"
            aria-hidden="true"
          />
        </span>
      </Listbox.Button>
      <Transition
        leave="transition duration-75 ease-out"
        leaveFrom="transform scale-100 opacity-100"
        leaveTo="transform scale-95 opacity-0"
      >
        <Listbox.Options className="absolute mt-1 p-1 w-44 overflow-auto rounded-md bg-white/80 dark:bg-gray-900/90 backdrop-blur-sm shadow-lg text-sm font-bold border border-gray-200 dark:border-gray-700">
          {Object.entries(frameworks).map(([key, value]) => (
            <Listbox.Option
              as={'a'}
              href={value.href}
              className="block relative cursor-pointer select-none py-2 pl-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
              key={key}
              value={key}
            >
              {({ selected }) => (
                <>
                  <span className="truncate flex items-center gap-2">{value.icon} {value.name}</span>
                  {selected
                    ? (<span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                        <CheckIcon
                          className="h-5 w-5 text-black dark:text-white"
                          aria-hidden="true"
                        />
                      </span>)
                    : null
                  }
                </>
              )}
            </Listbox.Option>
          ))}
        </Listbox.Options>
      </Transition>
    </Listbox>
  )
}