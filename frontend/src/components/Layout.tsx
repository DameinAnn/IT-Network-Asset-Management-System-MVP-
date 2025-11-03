import { Fragment } from "react";
import { Disclosure, Menu, Transition } from "@headlessui/react";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import { Link, NavLink } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

const navigation = [
  { name: "资产管理", to: "/assets", permission: "can_read_asset" },
  { name: "用户管理", to: "/users", permission: "can_manage_users" }
];

function classNames(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout } = useAuth();
  const role = user?.role;

  const filteredNavigation = navigation.filter((item) => (role as any)?.[item.permission]);

  return (
    <Disclosure as="nav" className="bg-white shadow">
      {({ open }) => (
        <>
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 justify-between">
              <div className="flex">
                <div className="flex flex-shrink-0 items-center text-lg font-semibold text-blue-600">
                  <Link to="/assets">资产管理系统</Link>
                </div>
                <div className="hidden sm:-my-px sm:ml-6 sm:flex sm:space-x-8">
                  {filteredNavigation.map((item) => (
                    <NavLink
                      key={item.name}
                      to={item.to}
                      className={({ isActive }) =>
                        classNames(
                          isActive
                            ? "border-blue-500 text-blue-600"
                            : "border-transparent text-slate-600 hover:border-slate-300 hover:text-slate-800",
                          "inline-flex items-center border-b-2 px-1 pt-1 text-sm font-medium"
                        )
                      }
                    >
                      {item.name}
                    </NavLink>
                  ))}
                </div>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:items-center">
                <Menu as="div" className="relative ml-3">
                  <div>
                    <Menu.Button className="flex rounded-full bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                      <span className="sr-only">打开用户菜单</span>
                      <span className="inline-flex items-center rounded-full bg-blue-500 px-3 py-1 text-sm font-medium text-white">
                        {user?.display_name || user?.username}
                      </span>
                    </Menu.Button>
                  </div>
                  <Transition
                    as={Fragment}
                    enter="transition ease-out duration-100"
                    enterFrom="transform opacity-0 scale-95"
                    enterTo="transform opacity-100 scale-100"
                    leave="transition ease-in duration-75"
                    leaveFrom="transform opacity-100 scale-100"
                    leaveTo="transform opacity-0 scale-95"
                  >
                    <Menu.Items className="absolute right-0 z-10 mt-2 w-40 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                      <Menu.Item>
                        {({ active }) => (
                          <button
                            onClick={logout}
                            className={classNames(
                              active ? "bg-slate-100" : "",
                              "block w-full px-4 py-2 text-left text-sm text-slate-700"
                            )}
                          >
                            退出登录
                          </button>
                        )}
                      </Menu.Item>
                    </Menu.Items>
                  </Transition>
                </Menu>
              </div>
              <div className="-mr-2 flex items-center sm:hidden">
                <Disclosure.Button className="inline-flex items-center justify-center rounded-md bg-white p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500">
                  <span className="sr-only">打开主菜单</span>
                  {open ? <XMarkIcon className="block h-6 w-6" aria-hidden="true" /> : <Bars3Icon className="block h-6 w-6" aria-hidden="true" />}
                </Disclosure.Button>
              </div>
            </div>
          </div>

          <Disclosure.Panel className="sm:hidden">
            <div className="space-y-1 pb-3 pt-2">
              {filteredNavigation.map((item) => (
                <NavLink
                  key={item.name}
                  to={item.to}
                  className={({ isActive }) =>
                    classNames(
                      isActive ? "bg-blue-50 border-blue-500 text-blue-700" : "border-transparent text-slate-600",
                      "block border-l-4 py-2 pl-3 pr-4 text-base font-medium"
                    )
                  }
                >
                  {item.name}
                </NavLink>
              ))}
              <button
                onClick={logout}
                className="block w-full border-l-4 border-transparent py-2 pl-3 pr-4 text-left text-base font-medium text-slate-600 hover:bg-slate-50"
              >
                退出登录
              </button>
            </div>
          </Disclosure.Panel>

          <main className="bg-slate-50 pb-8">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">{children}</div>
          </main>
        </>
      )}
    </Disclosure>
  );
};
